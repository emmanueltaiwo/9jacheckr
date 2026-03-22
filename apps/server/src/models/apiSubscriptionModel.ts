import mongoose, { Schema } from 'mongoose';

export type ApiSubscriptionPlan = 'free' | 'pro_api';
export type ApiSubscriptionStatus = 'active' | 'inactive';

const apiSubscriptionSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    plan: {
      type: String,
      enum: ['free', 'pro_api'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive',
    },
    currentPeriodEnd: { type: Date, default: null },
    paystackCustomerCode: { type: String, default: null, trim: true },
    paystackSubscriptionCode: { type: String, default: null, trim: true },
  },
  { timestamps: true },
);

export const ApiSubscriptionModel =
  mongoose.models.ApiSubscription ??
  mongoose.model('ApiSubscription', apiSubscriptionSchema);
