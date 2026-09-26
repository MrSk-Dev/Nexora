const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/vendorController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const upload = require('../utils/multerConfig');

// Vendor self-service
router.post('/apply', protect, applyForVendor);
router.get('/me', protect, authorize('vendor'), getMyVendorProfile);
router.put('/me', protect, authorize('vendor'), upload.single('logo'), updateMyVendorProfile);

// Admin approval
router.get('/admin/pending', protect, authorize('admin'), getPendingVendors);
router.put('/admin/:id/approve', protect, authorize('admin'), approveVendor);
router.put('/admin/:id/reject', protect, authorize('admin'), rejectVendor);
router.put('/admin/:id/suspend', protect, authorize('admin'), suspendVendor);
router.put('/admin/:id/reactivate', protect, authorize('admin'), reactivateVendor);
router.get('/admin/all', protect, authorize('admin'), getAllVendors);

// Public storefront (must come after the above so /me and /admin aren't swallowed by :userId)
router.get('/:userId', getVendorStorefront);

module.exports = router;