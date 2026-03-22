import mongoose, { Schema } from 'mongoose';

const botDailyUsageSchema = new Schema(
  {
    telegramId: { type: String, required: true, index: true },
    dateKey: { type: String, required: true },
    verifyCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

botDailyUsageSchema.index({ telegramId: 1, dateKey: 1 }, { unique: true });

export const BotDailyUsageModel =
  mongoose.models.BotDailyUsage ??
  mongoose.model('BotDailyUsage', botDailyUsageSchema);
