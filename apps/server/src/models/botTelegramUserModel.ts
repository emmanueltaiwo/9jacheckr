import mongoose, { Schema } from 'mongoose';

const botTelegramUserSchema = new Schema(
  {
    telegramId: { type: String, required: true, unique: true, index: true },
    username: { type: String, default: null },
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    firstSeenAt: { type: Date, required: true },
    lastActiveAt: { type: Date, required: true },
    startsCount: { type: Number, default: 0 },
    verifyCount: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'bot_telegram_users' },
);

export const BotTelegramUserModel =
  mongoose.models.BotTelegramUser ??
  mongoose.model('BotTelegramUser', botTelegramUserSchema);
