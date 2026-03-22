import mongoose, { Schema } from 'mongoose';

const botBillingPaymentSchema = new Schema(
  {
    telegramId: { type: String, required: true, index: true, trim: true },
    paystackReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    amountKobo: { type: Number, required: true },
    currency: { type: String, default: 'NGN', trim: true },
    status: { type: String, default: 'success', trim: true },
    channel: { type: String, default: null, trim: true },
    paidAt: { type: Date, default: null },
    description: { type: String, default: null, trim: true },
    sourceEvent: { type: String, default: null, trim: true },
  },
  { timestamps: true },
);

botBillingPaymentSchema.index({ telegramId: 1, paidAt: -1 });

export const BotBillingPaymentModel =
  mongoose.models.BotBillingPayment ??
  mongoose.model('BotBillingPayment', botBillingPaymentSchema);
