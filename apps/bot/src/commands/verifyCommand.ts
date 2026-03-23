import axios from 'axios';
import type { Context, Telegraf } from 'telegraf';
import {
  fetchBotStatus,
  initializeBotProCheckout,
  telegramUserToCaller,
  verifyNafdac,
  verifyNafdacFromImage,
} from '../services/apiClient.js';
import type { VerifyResponseDto } from '../types/apiTypes.js';
import {
  formatErrorMessage,
  formatNotFoundMessage,
  formatVerifyReply,
} from '../utils/formatProductMessage.js';
import { logger } from '../utils/logger.js';
import { verifyButtonMarkup } from '../utils/verifyButton.js';

type UpgradeCtx = { maxMonths: number; monthlyKobo: number };

const verifyHowToPrompt = [
  'Send the NAFDAC number as text (e.g. <code>01-5713</code>).',
  '',
  '<b>Bot Pro:</b> you can send a <b>photo</b> or image file of the number instead.',
].join('\n');

export function registerVerifyCommand(bot: Telegraf, apiBaseUrl: string) {
  const pendingByChatId = new Map<number, ReturnType<typeof setTimeout>>();
  const upgradeTimeoutByChatId = new Map<
    number,
    ReturnType<typeof setTimeout>
  >();
  const upgradeCtxByChatId = new Map<number, UpgradeCtx>();

  function clearPending(chatId: number) {
    const existing = pendingByChatId.get(chatId);
    if (existing) clearTimeout(existing);
    pendingByChatId.delete(chatId);
  }

  function setPending(chatId: number) {
    clearPending(chatId);
    const t = setTimeout(() => clearPending(chatId), 60_000);
    pendingByChatId.set(chatId, t);
  }

  function clearUpgrade(chatId: number) {
    const t = upgradeTimeoutByChatId.get(chatId);
    if (t) clearTimeout(t);
    upgradeTimeoutByChatId.delete(chatId);
    upgradeCtxByChatId.delete(chatId);
  }

  function setUpgrade(chatId: number, ctx: UpgradeCtx) {
    clearUpgrade(chatId);
    const t = setTimeout(() => clearUpgrade(chatId), 120_000);
    upgradeTimeoutByChatId.set(chatId, t);
    upgradeCtxByChatId.set(chatId, ctx);
  }

  const replyOpts = {
    parse_mode: 'HTML' as const,
    reply_markup: verifyButtonMarkup,
  };

  async function sendVerifyOutcome(
    ctx: Context,
    res: VerifyResponseDto,
    notFoundFallback?: string,
  ) {
    if (res.ok) {
      await ctx.reply(formatVerifyReply(res.product), replyOpts);
      return;
    }
    if (res.code === 'NOT_FOUND') {
      const label = res.nafdac?.trim() || notFoundFallback?.trim() || '';
      await ctx.reply(
        label ? formatNotFoundMessage(label) : formatErrorMessage(res.message),
        replyOpts,
      );
      return;
    }
    if (res.code === 'INVALID_NAFDAC') {
      await ctx.reply(formatErrorMessage(res.message), replyOpts);
      return;
    }
    if (res.code === 'BOT_DAILY_LIMIT') {
      await ctx.reply(
        [
          '<b>Daily limit reached</b>',
          '',
          'Without Bot Pro, this bot allows 5 lookups per UTC day (resets midnight UTC).',
          '/upgrade — Bot Pro (no daily cap). /status — your plan and usage.',
        ].join('\n'),
        replyOpts,
      );
      return;
    }
    if (res.code === 'FEATURE_REQUIRES_BOT_PRO') {
      await ctx.reply(
        [
          '<b>Bot Pro only</b>',
          '',
          'Photo lookup is for Bot Pro. /upgrade to prepay, or use /verify with the number as text.',
        ].join('\n'),
        replyOpts,
      );
      return;
    }
    if (res.code === 'NO_NAFDAC_IN_IMAGE') {
      await ctx.reply(formatErrorMessage(res.message), replyOpts);
      return;
    }
    if (res.code === 'AMBIGUOUS_NAFDAC') {
      const list =
        Array.isArray(res.candidates) && res.candidates.length > 0
          ? res.candidates
              .map((c) => `<code>${escapeHtml(c)}</code>`)
              .join(', ')
          : '—';
      await ctx.reply(
        [
          '<b>Multiple numbers in the image</b>',
          '',
          `Found: ${list}`,
          '',
          'Send one of them as a text message or use /verify &lt;number&gt;.',
        ].join('\n'),
        replyOpts,
      );
      return;
    }
    if (res.code === 'OCR_FAILED' || res.code === 'EXTRACTION_FAILED') {
      await ctx.reply(formatErrorMessage(res.message), replyOpts);
      return;
    }
    await ctx.reply(formatErrorMessage(res.message), replyOpts);
  }

  function imageContentType(
    mime: string | undefined,
  ): 'image/jpeg' | 'image/png' | 'image/webp' | null {
    const m = mime?.split(';')[0]?.trim().toLowerCase();
    if (m === 'image/jpeg' || m === 'image/jpg') return 'image/jpeg';
    if (m === 'image/png') return 'image/png';
    if (m === 'image/webp') return 'image/webp';
    return null;
  }

  async function handleProVerifyImage(ctx: Context) {
    const chatId = typeof ctx.chat?.id === 'number' ? ctx.chat.id : null;
    const from = ctx.from;
    if (!chatId || !from) return;

    let ct: 'image/jpeg' | 'image/png' | 'image/webp' | null = null;
    if (ctx.message && 'photo' in ctx.message && ctx.message.photo?.length) {
      ct = 'image/jpeg';
    } else if (ctx.message && 'document' in ctx.message) {
      ct = imageContentType(ctx.message.document?.mime_type);
    }
    if (!ct) {
      await ctx.reply('Use a JPEG, PNG, or WebP image.', replyOpts);
      return;
    }

    if (upgradeTimeoutByChatId.has(chatId)) {
      await ctx.reply(
        'Finish choosing months (send a number) or wait ~2 minutes, then try a photo again.',
      );
      return;
    }

    const telegramId = String(from.id);
    const status = await fetchBotStatus(apiBaseUrl, telegramId);
    if (!status.ok) {
      await ctx.reply(status.message ?? 'Could not load your plan.', replyOpts);
      return;
    }
    if (status.plan !== 'pro_bot') {
      await sendVerifyOutcome(ctx, {
        ok: false,
        code: 'FEATURE_REQUIRES_BOT_PRO',
        message: 'Bot Pro only',
      });
      return;
    }

    clearPending(chatId);
    clearUpgrade(chatId);

    let fileId: string | undefined;
    if (ctx.message && 'photo' in ctx.message && ctx.message.photo?.length) {
      const sizes = ctx.message.photo;
      fileId = sizes[sizes.length - 1]?.file_id;
    } else if (ctx.message && 'document' in ctx.message) {
      fileId = ctx.message.document?.file_id;
    }
    if (!fileId) {
      await ctx.reply('Could not read the image file.');
      return;
    }

    await ctx.reply('Reading the image…');

    try {
      const link = await ctx.telegram.getFileLink(fileId);
      const fileRes = await axios.get<ArrayBuffer>(link.href, {
        responseType: 'arraybuffer',
        timeout: 45_000,
        maxContentLength: 9 * 1024 * 1024,
        maxBodyLength: 9 * 1024 * 1024,
      });
      const buf = Buffer.from(fileRes.data);
      const caller = telegramUserToCaller(from);
      const res = await verifyNafdacFromImage(apiBaseUrl, buf, ct, caller);
      await sendVerifyOutcome(ctx, res);
    } catch (err) {
      logger.error('verify image failed', { message: String(err) });
      await ctx.reply(
        formatErrorMessage(
          'Could not process the image. Try again or use /verify with text.',
        ),
        replyOpts,
      );
    }
  }

  bot.on('photo', async (ctx) => {
    await handleProVerifyImage(ctx);
  });

  bot.on('document', async (ctx) => {
    const mime = ctx.message.document?.mime_type?.toLowerCase() ?? '';
    if (!mime.startsWith('image/')) {
      return;
    }
    await handleProVerifyImage(ctx);
  });

  bot.action('VERIFY', async (ctx) => {
    await ctx.answerCbQuery();
    const chatId = typeof ctx.chat?.id === 'number' ? ctx.chat.id : null;
    if (!chatId) return;

    clearUpgrade(chatId);
    setPending(chatId);
    await ctx.reply(verifyHowToPrompt, replyOpts);
  });

  bot.on('text', async (ctx, next) => {
    const chatId = typeof ctx.chat?.id === 'number' ? ctx.chat.id : null;
    const text =
      ctx.message && 'text' in ctx.message ? (ctx.message.text as string) : '';
    const trimmed = typeof text === 'string' ? text.trim() : '';

    if (!chatId || !trimmed) return next();
    if (trimmed.startsWith('/')) return next();

    if (upgradeTimeoutByChatId.has(chatId)) {
      const uctx = upgradeCtxByChatId.get(chatId);
      const from = ctx.from;
      if (!uctx || !from) {
        clearUpgrade(chatId);
        return next();
      }

      const months = Number.parseInt(trimmed, 10);
      if (!Number.isInteger(months) || months < 1 || months > uctx.maxMonths) {
        await ctx.reply(
          `Send a whole number of months from 1 to ${uctx.maxMonths}.`,
        );
        return;
      }

      clearUpgrade(chatId);
      const telegramId = String(from.id);
      const r = await initializeBotProCheckout(apiBaseUrl, telegramId, months);
      if (!r.ok) {
        await ctx.reply(`Could not start checkout: ${r.message}`);
        return;
      }

      const unit = uctx.monthlyKobo / 100;
      const total = unit * months;
      await ctx.reply(
        [
          `<a href="${escapeAttr(r.authorizationUrl)}">Tap to pay on Paystack</a>`,
          '',
          `<b>Bot Pro prepay:</b> ${months} mo × ₦${unit.toLocaleString('en-NG')} = <b>₦${total.toLocaleString('en-NG')}</b>`,
          '',
          'After payment, Pro activates automatically (usually within a minute). /status — plan &amp; period end.',
        ].join('\n'),
        { parse_mode: 'HTML', link_preview_options: { is_disabled: true } },
      );
      return;
    }

    if (!pendingByChatId.has(chatId)) return next();

    const nafdac = trimmed;
    clearPending(chatId);

    logger.info('verify pending value received', { chatId, nafdac });
    await ctx.reply('Checking NAFDAC registry…');

    const caller = ctx.from ? telegramUserToCaller(ctx.from) : undefined;
    const res = await verifyNafdac(apiBaseUrl, nafdac, caller);
    logger.info('verify pending result', {
      nafdac,
      ok: res.ok,
      code: res.ok ? undefined : res.code,
    });
    await sendVerifyOutcome(ctx, res, nafdac);
  });

  bot.command('verify', async (ctx) => {
    const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
    const arg = text.split(/\s+/).slice(1).join(' ').trim();
    logger.info('verify command handler', { text, arg });
    if (!arg) {
      const chatId = typeof ctx.chat?.id === 'number' ? ctx.chat.id : null;
      if (!chatId) {
        await ctx.reply(verifyHowToPrompt, replyOpts);
        return;
      }

      clearUpgrade(chatId);
      setPending(chatId);
      logger.info('verify pending set', { chatId });
      await ctx.reply(verifyHowToPrompt, replyOpts);
      return;
    }

    logger.info('verify command received', { nafdac: arg });
    await ctx.reply('Checking NAFDAC registry…');

    try {
      const caller = ctx.from ? telegramUserToCaller(ctx.from) : undefined;
      const res = await verifyNafdac(apiBaseUrl, arg, caller);
      logger.info('verify command result', {
        nafdac: arg,
        ok: res.ok,
        code: res.ok ? undefined : res.code,
      });
      await sendVerifyOutcome(ctx, res, arg);
    } catch (err) {
      logger.error('verify command failed', { message: String(err) });

      await ctx.reply(
        formatErrorMessage('Unexpected error. Try again later.'),
        {
          parse_mode: 'HTML',
          reply_markup: verifyButtonMarkup,
        },
      );
    }
  });

  bot.command('upgrade', async (ctx) => {
    const from = ctx.from;
    const chatId = typeof ctx.chat?.id === 'number' ? ctx.chat.id : null;
    if (!from || chatId == null) {
      await ctx.reply('Could not read your Telegram account.');
      return;
    }
    const telegramId = String(from.id);

    if (pendingByChatId.has(chatId)) {
      await ctx.reply(
        'Finish the NAFDAC lookup first (send the number or wait ~1 minute), then use /upgrade.',
      );
      return;
    }

    const status = await fetchBotStatus(apiBaseUrl, telegramId);
    if (status.ok && status.plan === 'pro_bot') {
      const periodLine =
        status.periodEnd != null
          ? `\n\n<b>Current period ends (UTC):</b> ${formatUpgradeUtcDate(status.periodEnd)}`
          : '';
      await ctx.reply(
        [
          '<b>You already have Bot Pro</b>',
          '',
          'Unlimited lookups until the period above ends — then the free tier (5/day UTC) applies again.',
          '/status — plan &amp; usage',
          '/payments — payment history',
          periodLine,
        ]
          .filter(Boolean)
          .join('\n'),
        { parse_mode: 'HTML', reply_markup: verifyButtonMarkup },
      );
      return;
    }

    const monthlyKobo =
      status.ok && status.prepayMonthlyKobo != null
        ? status.prepayMonthlyKobo
        : 100_000;
    const maxMonths =
      status.ok && status.prepayMaxMonths != null ? status.prepayMaxMonths : 24;
    const unitMajor = monthlyKobo / 100;

    setUpgrade(chatId, { monthlyKobo, maxMonths });

    await ctx.reply(
      [
        '<b>Bot Pro — prepay</b>',
        '',
        `How many months? Send a whole number from <b>1</b> to <b>${maxMonths}</b>.`,
        '',
        `Price: <b>₦${unitMajor.toLocaleString('en-NG')}</b> per month (total = months × that amount).`,
        '',
        'You will get a Paystack link (card, transfer, USSD — whatever your bank supports on Paystack).',
      ].join('\n'),
      { parse_mode: 'HTML', reply_markup: verifyButtonMarkup },
    );
  });
}

function formatUpgradeUtcDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-NG', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
