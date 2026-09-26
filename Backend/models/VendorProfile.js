const mongoose = require('mongoose');

const vendorProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    storeName: { type: String, required: [true, 'Store name is required'], trim: true },
    storeDescription: { type: String, trim: true },
    businessEmail: { type: String, trim: true, lowercase: true },
    businessPhone: { type: String, trim: true },
    gstNumber: { type: String, trim: true },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'], default: 'pending' },
    rejectionReason: { type: String },
    logoUrl: { type: String },
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VendorProfile', vendorProfileSchema);