const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    slug: { type: String, lowercase: true },
    description: { type: String, required: [true, 'Product description is required'] },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    discountPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: [{ type: String }],
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: { type: String },
    isActive: { type: Boolean, default: true },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' });

productSchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().trim().replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-5);
  }
});

module.exports = mongoose.model('Product', productSchema);