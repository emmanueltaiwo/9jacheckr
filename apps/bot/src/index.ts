import 'dotenv/config';
import { Telegraf } from 'telegraf';
import { registerPaymentsCommand } from './commands/paymentsCommand.js';
import { registerStatusCommand } from './commands/statusCommand.js';
import { registerVerifyCommand } from './commands/verifyCommand.js';
import {
  recordBotActivity,
  telegramUserToCaller,
} from './services/apiClient.js';
import { logger } from './utils/logger.js';
import { verifyButtonMarkup } from './utils/verifyButton.js';
import {
  isNafdacUnavailable,
  NAFDAC_UNAVAILABLE_REPLY,
} from './utils/nafdacAvailability.js';

const token = process.env.TELEGRAM_BOT_TOKEN ?? '';
const apiBase = process.env.API_BASE_URL ?? '';

async function main() {
  if (!token) {
    logger.error('TELEGRAM_BOT_TOKEN is required');
    process.exit(1);
  }
  if (!apiBase) {
    logger.error('API_BASE_URL is required');
    process.exit(1);
  }

  logger.info('Bot starting', { apiBaseUrl: apiBase });

  const bot = new Telegraf(token);

  bot.use(async (ctx, next) => {
    if (!isNafdacUnavailable()) {
      return next();
    }
    const msg = ctx.message;
    if (
      msg &&
      'successful_payment' in msg &&
      msg.successful_payment
    ) {
      return next();
    }
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery('Verification temporarily unavailable.');
      return;
    }
    if (ctx.message) {
      await ctx.reply(NAFDAC_UNAVAILABLE_REPLY, { parse_mode: 'HTML' });
      return;
    }
    return next();
  });

  registerVerifyCommand(bot, apiBase);
  registerStatusCommand(bot, apiBase);
  registerPaymentsCommand(bot, apiBase);

  bot.command('start', async (ctx) => {
    if (ctx.from) {
      void recordBotActivity(apiBase, 'start', telegramUserToCaller(ctx.from));
    }
    await ctx.reply(
      [
        '<b>9ja Checkr</b>',
        '',
        'Look up Nigerian product NAFDAC registration numbers (independent service — not NAFDAC).',
        '<a href="https://9jacheckr.xyz/disclaimer">Disclaimer</a>',
        '',
        'Commands:',
        '/verify &lt;number&gt; — look up a registration (Bot Pro: send a photo of the number)',
        '/status — plan, total lookups, and today’s usage (UTC)',
        '/payments — Bot Pro payment history (Paystack)',
        '/upgrade — prepay Bot Pro (choose months, then Paystack link; no daily cap until it expires)',
        '',
        '<i>Free tier: 5 lookups per UTC day. Bot Pro: unlimited until prepaid period ends; you can also send a <b>photo</b> of the NAFDAC number. /status shows your plan.</i>',
      ].join('\n'),
      { parse_mode: 'HTML', reply_markup: verifyButtonMarkup },
    );
  });

  bot.catch((err, ctx) => {
    logger.error('Bot error', {
      message: String(err),
      updateId: ctx?.update?.update_id,
    });
  });

  await bot.launch();
  logger.info('Telegram bot running');

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

main().catch((err) => {
  logger.error('Fatal bot error', { message: String(err) });
  process.exit(1);
});
