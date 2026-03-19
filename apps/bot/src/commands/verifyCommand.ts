import type { Telegraf } from 'telegraf';
import { verifyNafdac } from '../services/apiClient.js';
import {
  formatErrorMessage,
  formatNotFoundMessage,
  formatVerifyReply,
} from '../utils/formatProductMessage.js';
import { logger } from '../utils/logger.js';
import { verifyButtonMarkup } from '../utils/verifyButton.js';

export function registerVerifyCommand(bot: Telegraf, apiBaseUrl: string) {
  const pendingByChatId = new Map<number, ReturnType<typeof setTimeout>>();

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

  bot.action('VERIFY', async (ctx) => {
    await ctx.answerCbQuery();
    const chatId = typeof ctx.chat?.id === 'number' ? ctx.chat.id : null;
    if (!chatId) return;

    setPending(chatId);
    await ctx.reply('Send only the NAFDAC number (e.g. 01-5713).');
  });

  bot.on('text', async (ctx, next) => {
    const chatId = typeof ctx.chat?.id === 'number' ? ctx.chat.id : null;
    const text =
      ctx.message && 'text' in ctx.message ? (ctx.message.text as string) : '';
    const trimmed = typeof text === 'string' ? text.trim() : '';

    if (!chatId || !trimmed) return next();
    if (trimmed.startsWith('/')) return next();

    if (!pendingByChatId.has(chatId)) return next();

    const nafdac = trimmed;
    clearPending(chatId);

    logger.info('verify pending value received', { chatId, nafdac });
    await ctx.reply('Checking NAFDAC registry…');

    const res = await verifyNafdac(apiBaseUrl, nafdac);
    if (res.ok) {
      logger.info('verify API success', { nafdac });
      await ctx.reply(formatVerifyReply(res.product), {
        parse_mode: 'HTML',
        reply_markup: verifyButtonMarkup,
      });
      return;
    }

    logger.warn('verify API returned false', { nafdac, code: res.code });
    if (res.code === 'NOT_FOUND') {
      await ctx.reply(formatNotFoundMessage(nafdac), {
        parse_mode: 'HTML',
        reply_markup: verifyButtonMarkup,
      });
      return;
    }

    if (res.code === 'INVALID_NAFDAC') {
      await ctx.reply(formatErrorMessage(res.message), {
        parse_mode: 'HTML',
        reply_markup: verifyButtonMarkup,
      });
      return;
    }

    await ctx.reply(formatErrorMessage(res.message), {
      parse_mode: 'HTML',
      reply_markup: verifyButtonMarkup,
    });
  });

  bot.command('verify', async (ctx) => {
    const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
    const arg = text.split(/\s+/).slice(1).join(' ').trim();
    logger.info('verify command handler', { text, arg });
    if (!arg) {
      const chatId = typeof ctx.chat?.id === 'number' ? ctx.chat.id : null;
      if (!chatId) {
        await ctx.reply('Send the NAFDAC number as text.');
        return;
      }

      setPending(chatId);
      logger.info('verify pending set', { chatId });
      await ctx.reply('Send only the NAFDAC number (e.g. 01-5713).');
      return;
    }

    logger.info('verify command received', { nafdac: arg });
    await ctx.reply('Checking NAFDAC registry…');

    try {
      const res = await verifyNafdac(apiBaseUrl, arg);
      if (res.ok) {
        logger.info('verify API success', { nafdac: arg });
        await ctx.reply(formatVerifyReply(res.product), {
          parse_mode: 'HTML',
          reply_markup: verifyButtonMarkup,
        });
        return;
      }

      logger.warn('verify API returned false', { nafdac: arg, code: res.code });
      if (res.code === 'NOT_FOUND') {
        await ctx.reply(formatNotFoundMessage(arg), {
          parse_mode: 'HTML',
          reply_markup: verifyButtonMarkup,
        });
        return;
      }

      if (res.code === 'INVALID_NAFDAC') {
        await ctx.reply(formatErrorMessage(res.message), {
          parse_mode: 'HTML',
          reply_markup: verifyButtonMarkup,
        });
        return;
      }

      await ctx.reply(formatErrorMessage(res.message), {
        parse_mode: 'HTML',
        reply_markup: verifyButtonMarkup,
      });
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
}
