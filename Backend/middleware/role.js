const VendorProfile = require('../models/VendorProfile');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

const requireApprovedVendor = async (req, res, next) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ success: false, message: 'Vendor role required' });
    }

    const vendorProfile = await VendorProfile.findOne({ user: req.user._id });

    if (!vendorProfile) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    if (vendorProfile.approvalStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: `Vendor account is ${vendorProfile.approvalStatus}. Approval required to perform this action.`,
      });
    }

    req.vendorProfile = vendorProfile;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error checking vendor approval' });
  }
};

module.exports = { authorize, requireApprovedVendor };