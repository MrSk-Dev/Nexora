const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get logged-in user's wishlist
// @route   GET /api/wishlist
// @access  Private (customer)
const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
    if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching wishlist', error: error.message });
  }
};

// @desc    Add a product to wishlist
// @route   POST /api/wishlist
// @access  Private (customer)
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'productId is required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });

    const alreadyExists = wishlist.products.some((p) => String(p) === String(productId));
    if (!alreadyExists) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    await wishlist.populate('products');
    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error adding to wishlist', error: error.message });
  }
};

// @desc    Remove a product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private (customer)
const removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) return res.status(404).json({ success: false, message: 'Wishlist not found' });

    wishlist.products = wishlist.products.filter((p) => String(p) !== String(req.params.productId));
    await wishlist.save();
    await wishlist.populate('products');
    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error removing from wishlist', error: error.message });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
