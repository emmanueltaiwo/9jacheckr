import type { Telegraf } from 'telegraf';
import { fetchBotBillingTransactions } from '../services/apiClient.js';
import { logger } from '../utils/logger.js';
import { verifyButtonMarkup } from '../utils/verifyButton.js';

function formatUtcDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-NG', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatMajor(amountKobo: number, currency: string): string {
  const major = amountKobo / 100;
  const sym = currency === 'NGN' ? '₦' : `${currency} `;
  return `${sym}${major.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function registerPaymentsCommand(bot: Telegraf, apiBaseUrl: string) {
  bot.command('payments', async (ctx) => {
    const from = ctx.from;
    if (!from) {
      await ctx.reply('Could not read your Telegram account.');
      return;
    }
    const telegramId = String(from.id);
    const r = await fetchBotBillingTransactions(apiBaseUrl, telegramId, 1, 15);
    if (!r.ok) {
      logger.warn('payments command failed', {
        telegramId,
        message: r.message,
      });
      await ctx.reply(r.message ?? 'Could not load payment history.', {
        reply_markup: verifyButtonMarkup,
      });
      return;
    }

    if (r.transactions.length === 0) {
      await ctx.reply(
        [
          '<b>Bot Pro payments</b>',
          '',
          'No recorded payments yet. Successful Paystack charges appear here after webhook processing.',
          '',
          'Use /upgrade to subscribe.',
        ].join('\n'),
        { parse_mode: 'HTML', reply_markup: verifyButtonMarkup },
      );
      return;
    }

    const lines: string[] = [
      '<b>Bot Pro payment history</b>',
      `<i>Showing ${r.transactions.length} of ${r.meta.total} (UTC)</i>`,
      '',
    ];

    for (const tx of r.transactions) {
      const when = tx.paidAt
        ? formatUtcDateTime(tx.paidAt)
        : tx.createdAt
          ? formatUtcDateTime(tx.createdAt)
          : '—';
      const amt = formatMajor(tx.amountKobo, tx.currency);
      const ch = tx.channel ? ` · ${tx.channel}` : '';
      lines.push(
        `• ${amt}${ch}`,
        `  <code>${escapeHtml(tx.reference.slice(0, 32))}</code>`,
        `  ${escapeHtml(when)}`,
        '',
      );
    }

    if (r.meta.pageCount > 1) {
      lines.push(
        `<i>Page ${r.meta.page} of ${r.meta.pageCount} — latest charges first.</i>`,
      );
    }

    const text = lines.join('\n').trim();
    const max = 3900;
    await ctx.reply(text.length > max ? `${text.slice(0, max - 20)}…` : text, {
      parse_mode: 'HTML',
      reply_markup: verifyButtonMarkup,
    });
  });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
