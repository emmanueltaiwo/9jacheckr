import mongoose, { Schema } from 'mongoose';

const apiKeySchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    label: { type: String, default: '', trim: true },
    keyPrefix: { type: String, required: true, index: true, trim: true },
    keyHash: { type: String, required: true, trim: true },
    lastUsedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

apiKeySchema.index({ userId: 1, revokedAt: 1 });

export const ApiKeyModel =
  mongoose.models.ApiKey ?? mongoose.model('ApiKey', apiKeySchema);
