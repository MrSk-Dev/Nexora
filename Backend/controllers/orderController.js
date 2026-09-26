const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Place an order from the customer's cart (COD only)
// @route   POST /api/orders
// @access  Private (customer)
const placeOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode || !shippingAddress.country) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required' });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Snapshot product data at purchase time — later product edits never affect this order
    const orderItems = [];
    for (const item of cart.items) {
      const product = item.product;
      if (!product || product.approvalStatus !== 'approved' || !product.isActive) {
        return res.status(400).json({ success: false, message: `Product "${product?.name || 'unknown'}" is no longer available` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for "${product.name}"` });
      }

      orderItems.push({
        product: product._id,
        vendor: product.vendor,
        name: product.name,
        image: product.images?.[0] || '',
        price: product.discountPrice || product.price,
        quantity: item.quantity,
      });
    }

    const itemsTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: 'COD',
      itemsTotal,
      status: 'placed',
    });

    // Deduct stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    // Empty the cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error placing order', error: error.message });
  }
};

// @desc    Get logged-in customer's own orders
// @route   GET /api/orders/mine
// @access  Private (customer)
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching orders', error: error.message });
  }
};

// @desc    Get a single order by ID (owner, admin, or vendor with an item in it)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const isOwner = String(order.customer) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';
    const isVendorInOrder = req.user.role === 'vendor' && order.items.some((item) => String(item.vendor) === String(req.user._id));

    if (!isOwner && !isAdmin && !isVendorInOrder) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching order', error: error.message });
  }
};

// @desc    Get orders containing the logged-in vendor's products
// @route   GET /api/orders/vendor/mine
// @access  Private (vendor)
const getVendorOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'items.vendor': req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching vendor orders', error: error.message });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('customer', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching orders', error: error.message });
  }
};

// @desc    Update order status (flat status, MVP)
// @route   PUT /api/orders/:id/status
// @access  Private (admin or vendor with an item in the order)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const isAdmin = req.user.role === 'admin';
    const isVendorInOrder = req.user.role === 'vendor' && order.items.some((item) => String(item.vendor) === String(req.user._id));

    if (!isAdmin && !isVendorInOrder) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this order' });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating order status', error: error.message });
  }
};

module.exports = { placeOrder, getMyOrders, getOrderById, getVendorOrders, getAllOrders, updateOrderStatus };