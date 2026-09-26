const express = require('express');
const router = express.Router();

const {
  placeOrder,
  getMyOrders,
  getOrderById,
  getVendorOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.post('/', protect, authorize('customer'), placeOrder);
router.get('/mine', protect, authorize('customer'), getMyOrders);
router.get('/vendor/mine', protect, authorize('vendor'), getVendorOrders);
router.get('/', protect, authorize('admin'), getAllOrders);
router.put('/:id/status', protect, authorize('admin', 'vendor'), updateOrderStatus);
router.get('/:id', protect, getOrderById);

module.exports = router;