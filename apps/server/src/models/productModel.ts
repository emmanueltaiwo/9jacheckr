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

/** One text index per collection: all customer-visible fields + ingredients (array strings). */
productSchema.index(
  {
    nafdac: 'text',
    name: 'text',
    category: 'text',
    source: 'text',
    manufacturer: 'text',
    ingredients: 'text',
  },
  {
    name: 'product_fulltext_v2',
    default_language: 'none',
    weights: {
      name: 10,
      nafdac: 10,
      manufacturer: 8,
      category: 6,
      ingredients: 6,
      source: 4,
    },
  },
);

export const ProductModel =
  mongoose.models.Product ?? mongoose.model('Product', productSchema);
