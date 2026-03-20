import mongoose, { Schema } from 'mongoose';

const botUsageMonthlySchema = new Schema(
  {
    yearMonth: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    total: { type: Number, default: 0 },
    found: { type: Number, default: 0 },
    notFound: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'bot_usage_monthly' },
);

export const BotUsageMonthlyModel =
  mongoose.models.BotUsageMonthly ??
  mongoose.model('BotUsageMonthly', botUsageMonthlySchema);
