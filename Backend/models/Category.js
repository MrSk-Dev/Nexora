const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Category name is required'], unique: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, trim: true },
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().trim().replace(/\s+/g, '-');
  }
});

module.exports = mongoose.model('Category', categorySchema);