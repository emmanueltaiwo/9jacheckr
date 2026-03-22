import mongoose, { Schema } from 'mongoose';

const monthlyApiUsageSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    periodKey: { type: String, required: true },
    verifyCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

monthlyApiUsageSchema.index({ userId: 1, periodKey: 1 }, { unique: true });

export const MonthlyApiUsageModel =
  mongoose.models.MonthlyApiUsage ??
  mongoose.model('MonthlyApiUsage', monthlyApiUsageSchema);
