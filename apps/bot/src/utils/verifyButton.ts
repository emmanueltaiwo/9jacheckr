import { Markup } from 'telegraf';

export const verifyButtonMarkup = Markup.inlineKeyboard([
  [Markup.button.callback('Verify A Product', 'VERIFY')],
]).reply_markup;
