import type { Telegraf } from 'telegraf';
import { fetchBotStatus } from '../services/apiClient.js';
import { logger } from '../utils/logger.js';
import { verifyButtonMarkup } from '../utils/verifyButton.js';

function formatUtcDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-NG', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function registerStatusCommand(bot: Telegraf, apiBaseUrl: string) {
  bot.command('status', async (ctx) => {
    const from = ctx.from;
    if (!from) {
      await ctx.reply('Could not read your Telegram account.');
      return;
    }
    const telegramId = String(from.id);
    const r = await fetchBotStatus(apiBaseUrl, telegramId);
    if (!r.ok) {
      logger.warn('status command failed', { telegramId, message: r.message });
      await ctx.reply(r.message ?? 'Could not load your status.', {
        reply_markup: verifyButtonMarkup,
      });
      return;
    }

    const planLine =
      r.plan === 'pro_bot'
        ? '<b>Plan:</b> Bot Pro (active)'
        : '<b>Plan:</b> Free';

    const usageLines = [
      `<b>Total lookups (all time):</b> ${r.totalVerifyCount}`,
      `<b>Today (UTC):</b> ${r.dailyUsed} lookup${r.dailyUsed === 1 ? '' : 's'} — text: ${r.dailyTextUsed}, photo: ${r.dailyImageUsed}`,
    ];

    if (r.plan === 'free') {
      const remaining = Math.max(0, r.dailyLimit - r.dailyUsed);
      usageLines.push(
        `<b>Daily cap without Bot Pro:</b> ${r.dailyLimit} per UTC day (${remaining} left today)`,
      );
    }

    const extra: string[] = [];
    if (r.plan === 'pro_bot') {
      extra.push(
        r.periodEnd != null
          ? `<b>Prepaid period ends (UTC):</b> ${formatUtcDate(r.periodEnd)}`
          : '<i>Period end appears here after Paystack confirms your payment.</i>',
      );
    } else {
      extra.push(
        'Use /upgrade to prepay Bot Pro (no daily cap until it expires).',
      );
    }

    await ctx.reply([planLine, '', ...usageLines, '', ...extra].join('\n'), {
      parse_mode: 'HTML',
      reply_markup: verifyButtonMarkup,
    });
  });
}
