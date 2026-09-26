const express = require('express');
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getPendingProducts,
  approveProduct,
  rejectProduct,
  deactivateProduct,
  activateProduct,
  getAllProductsAdmin,
} = require('../controllers/productController');

const { protect } = require('../middleware/auth');
const { authorize, requireApprovedVendor } = require('../middleware/role');
const upload = require('../utils/multerConfig');

// Vendor
router.get('/vendor/mine', protect, authorize('vendor'), getMyProducts);
router.post('/', protect, authorize('vendor'), requireApprovedVendor, upload.array('images', 5), createProduct);
router.put('/:id', protect, authorize('vendor'), requireApprovedVendor, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, authorize('vendor'), requireApprovedVendor, deleteProduct);

// Admin
router.get('/admin/pending', protect, authorize('admin'), getPendingProducts);
router.put('/admin/:id/approve', protect, authorize('admin'), approveProduct);
router.put('/admin/:id/reject', protect, authorize('admin'), rejectProduct);
router.put('/admin/:id/deactivate', protect, authorize('admin'), deactivateProduct);
router.put('/admin/:id/activate', protect, authorize('admin'), activateProduct);
router.get('/admin/all', protect, authorize('admin'), getAllProductsAdmin);

// Public (must come after specific paths above, before /:id below)
router.get('/', getProducts);
router.get('/:id', getProductById);

module.exports = router;