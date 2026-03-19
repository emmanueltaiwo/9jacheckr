import mongoose, { Schema } from 'mongoose';

const productSchema = new Schema(
  {
    nafdac: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    category: { type: String, default: '', trim: true },
    source: { type: String, default: 'external', trim: true },
    manufacturer: { type: String, default: '', trim: true },
    approvedDate: { type: Date, default: null },
    expiryDate: { type: Date, default: null },
    ingredients: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const ProductModel =
  mongoose.models.Product ?? mongoose.model('Product', productSchema);
