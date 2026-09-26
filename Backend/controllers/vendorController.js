const VendorProfile = require('../models/VendorProfile');

// @desc    Existing customer applies to become a vendor
// @route   POST /api/vendors/apply
// @access  Private (any authenticated user)
const applyForVendor = async (req, res) => {
  try {
    const { storeName, storeDescription } = req.body;

    if (req.user.role === 'vendor') {
      const existingProfile = await VendorProfile.findOne({ user: req.user._id });
      return res.status(400).json({
        success: false,
        message: `You already have a vendor account (status: ${existingProfile?.approvalStatus}).`,
      });
    }

    if (req.user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Admin accounts cannot become vendors' });
    }

    if (!storeName) {
      return res.status(400).json({ success: false, message: 'Store name is required' });
    }

    // Upgrade the user's role and create their vendor profile, starting pending
    req.user.role = 'vendor';
    await req.user.save();

    const vendorProfile = await VendorProfile.create({
      user: req.user._id,
      storeName,
      storeDescription,
      approvalStatus: 'pending',
    });

    res.status(201).json({ success: true, message: 'Vendor application submitted', data: vendorProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error applying for vendor status', error: error.message });
  }
};

// @desc    Get logged-in vendor's own profile
// @route   GET /api/vendors/me
// @access  Private (vendor)
const getMyVendorProfile = async (req, res) => {
  try {
    const profile = await VendorProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching vendor profile', error: error.message });
  }
};

// @desc    Update logged-in vendor's own profile (storefront info, bank details)
// @route   PUT /api/vendors/me
// @access  Private (vendor)
const updateMyVendorProfile = async (req, res) => {
  try {
    const profile = await VendorProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Vendor profile not found' });

    const { storeName, storeDescription, businessEmail, businessPhone, gstNumber, bankDetails, logoUrl } = req.body;

    if (storeName) profile.storeName = storeName;
    if (storeDescription !== undefined) profile.storeDescription = storeDescription;
    if (businessEmail !== undefined) profile.businessEmail = businessEmail;
    if (businessPhone !== undefined) profile.businessPhone = businessPhone;
    if (gstNumber !== undefined) profile.gstNumber = gstNumber;
    if (bankDetails) profile.bankDetails = { ...profile.bankDetails, ...bankDetails };
    if (logoUrl) profile.logoUrl = logoUrl;

    // req.file if a logo upload route uses upload.single('logo') upstream
    if (req.file) {
      profile.logoUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await profile.save();
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating vendor profile', error: error.message });
  }
};

// @desc    Get a public vendor storefront by vendor's user id
// @route   GET /api/vendors/:userId
// @access  Public
const getVendorStorefront = async (req, res) => {
  try {
    const profile = await VendorProfile.findOne({ user: req.params.userId, approvalStatus: 'approved' });
    if (!profile) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching storefront', error: error.message });
  }
};

// @desc    Get all pending vendor accounts (admin)
// @route   GET /api/vendors/admin/pending
// @access  Private (admin)
const getPendingVendors = async (req, res) => {
  try {
    const vendors = await VendorProfile.find({ approvalStatus: 'pending' })
      .populate('user', 'name email createdAt')
      .sort({ createdAt: 1 });
    res.status(200).json({ success: true, count: vendors.length, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching pending vendors', error: error.message });
  }
};

// @desc    Approve a vendor account (admin) — first layer of the two-layer approval system
// @route   PUT /api/vendors/admin/:id/approve
// @access  Private (admin)
const approveVendor = async (req, res) => {
  try {
    const profile = await VendorProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ success: false, message: 'Vendor profile not found' });

    profile.approvalStatus = 'approved';
    profile.rejectionReason = undefined;
    await profile.save();

    res.status(200).json({ success: true, message: 'Vendor approved', data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error approving vendor', error: error.message });
  }
};

// @desc    Reject a vendor account (admin)
// @route   PUT /api/vendors/admin/:id/reject
// @access  Private (admin)
const rejectVendor = async (req, res) => {
  try {
    const { reason } = req.body;
    const profile = await VendorProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ success: false, message: 'Vendor profile not found' });

    profile.approvalStatus = 'rejected';
    profile.rejectionReason = reason || 'Did not meet marketplace requirements';
    await profile.save();

    res.status(200).json({ success: true, message: 'Vendor rejected', data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error rejecting vendor', error: error.message });
  }
};

// @desc    Suspend an approved vendor (admin) — temporarily blocks selling without deleting their account
// @route   PUT /api/vendors/admin/:id/suspend
// @access  Private (admin)
const suspendVendor = async (req, res) => {
  try {
    const { reason } = req.body;
    const profile = await VendorProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ success: false, message: 'Vendor profile not found' });

    profile.approvalStatus = 'suspended';
    profile.rejectionReason = reason || 'Suspended by admin';
    await profile.save();

    res.status(200).json({ success: true, message: 'Vendor suspended', data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error suspending vendor', error: error.message });
  }
};

// @desc    Reactivate a suspended vendor back to approved (admin)
// @route   PUT /api/vendors/admin/:id/reactivate
// @access  Private (admin)
const reactivateVendor = async (req, res) => {
  try {
    const profile = await VendorProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ success: false, message: 'Vendor profile not found' });

    profile.approvalStatus = 'approved';
    profile.rejectionReason = undefined;
    await profile.save();

    res.status(200).json({ success: true, message: 'Vendor reactivated', data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error reactivating vendor', error: error.message });
  }
};

// @desc    Get all vendors (any status) with their profiles — for admin management
// @route   GET /api/vendors/admin/all
// @access  Private (admin)
const getAllVendors = async (req, res) => {
  try {
    const vendors = await VendorProfile.find()
      .populate('user', 'name email createdAt')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: vendors.length, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching vendors', error: error.message });
  }
};

module.exports = {
  getMyVendorProfile,
  updateMyVendorProfile,
  getVendorStorefront,
  getPendingVendors,
  approveVendor,
  rejectVendor,
  applyForVendor,
  suspendVendor,
  reactivateVendor,
  getAllVendors,
};