import mongoose, { Schema } from 'mongoose';

const apiBillingPaymentSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    paystackReference: { type: String, required: true, unique: true, trim: true },
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

apiBillingPaymentSchema.index({ userId: 1, paidAt: -1 });

export const ApiBillingPaymentModel =
  mongoose.models.ApiBillingPayment ??
  mongoose.model('ApiBillingPayment', apiBillingPaymentSchema);
