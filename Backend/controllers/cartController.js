const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get logged-in user's cart
// @route   GET /api/cart
// @access  Private (customer)
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching cart', error: error.message });
  }
};

// @desc    Add item to cart (or increase quantity if already present)
// @route   POST /api/cart
// @access  Private (customer)
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'productId is required' });

    const product = await Product.findById(productId);
    if (!product || product.approvalStatus !== 'approved' || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not available' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const existingItem = cart.items.find((item) => String(item.product) === String(productId));
    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity) });
    }

    await cart.save();
    await cart.populate('items.product');
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error adding to cart', error: error.message });
  }
};

// @desc    Update quantity of an item in cart
// @route   PUT /api/cart/:productId
// @access  Private (customer)
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.find((item) => String(item.product) === String(req.params.productId));
    if (!item) return res.status(404).json({ success: false, message: 'Item not found in cart' });

    item.quantity = Number(quantity);
    await cart.save();
    await cart.populate('items.product');
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating cart item', error: error.message });
  }
};

// @desc    Remove an item from cart
// @route   DELETE /api/cart/:productId
// @access  Private (customer)
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter((item) => String(item.product) !== String(req.params.productId));
    await cart.save();
    await cart.populate('items.product');
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error removing cart item', error: error.message });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private (customer)
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = [];
    await cart.save();
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error clearing cart', error: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };