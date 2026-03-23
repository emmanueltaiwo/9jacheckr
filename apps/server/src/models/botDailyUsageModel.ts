import mongoose, { Schema } from 'mongoose';

const botDailyUsageSchema = new Schema(
  {
    telegramId: { type: String, required: true, index: true },
    dateKey: { type: String, required: true },
    /** Total bot lookups today (text + image) — used for free-tier daily cap */
    verifyCount: { type: Number, default: 0 },
    textVerifyCount: { type: Number, default: 0 },
    imageVerifyCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

botDailyUsageSchema.index({ telegramId: 1, dateKey: 1 }, { unique: true });

export const BotDailyUsageModel =
  mongoose.models.BotDailyUsage ??
  mongoose.model('BotDailyUsage', botDailyUsageSchema);
