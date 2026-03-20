import mongoose, { Schema } from 'mongoose';

const usageMonthlySchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    yearMonth: { type: String, required: true, trim: true },
    total: { type: Number, default: 0 },
    found: { type: Number, default: 0 },
    notFound: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'usage_monthly' },
);

usageMonthlySchema.index({ userId: 1, yearMonth: 1 }, { unique: true });

export const UsageMonthlyModel =
  mongoose.models.UsageMonthly ??
  mongoose.model('UsageMonthly', usageMonthlySchema);
