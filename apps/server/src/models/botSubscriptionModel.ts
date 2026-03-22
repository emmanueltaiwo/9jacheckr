import mongoose, { Schema } from 'mongoose';

const botSubscriptionSchema = new Schema(
  {
    telegramId: { type: String, required: true, unique: true, index: true },
    plan: {
      type: String,
      enum: ['free', 'pro_bot'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive',
    },
    currentPeriodEnd: { type: Date, default: null },
    paystackSubscriptionCode: { type: String, default: null, trim: true },
  },
  { timestamps: true },
);

export const BotSubscriptionModel =
  mongoose.models.BotSubscription ??
  mongoose.model('BotSubscription', botSubscriptionSchema);
