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
        'Verify Nigerian product NAFDAC numbers.',
        '',
        'Commands:',
        '/verify &lt;number&gt; — look up a registration',
        '/status — plan, total lookups, and today’s usage (UTC)',
        '/payments — Bot Pro payment history (Paystack)',
        '/upgrade — Bot Pro (no daily lookup cap)',
        '',
        '<i>Without Bot Pro: up to 5 lookups per UTC day. Bot Pro: unlimited. /status always shows your plan and usage.</i>',
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
