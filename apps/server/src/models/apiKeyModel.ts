import mongoose, { Schema } from 'mongoose';

const apiKeySchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    keyPrefix: { type: String, required: true, index: true, trim: true },
    keyHash: { type: String, required: true, trim: true },
    lastUsedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const ApiKeyModel =
  mongoose.models.ApiKey ?? mongoose.model('ApiKey', apiKeySchema);
