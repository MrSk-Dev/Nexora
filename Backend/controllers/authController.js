const User = require('../models/User');
const VendorProfile = require('../models/VendorProfile');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user (customer or vendor)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, storeName, storeDescription } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    // Admin accounts are never self-registered — created directly in DB or by another admin
    const allowedRoles = ['customer', 'vendor'];
    const finalRole = allowedRoles.includes(role) ? role : 'customer';

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    if (finalRole === 'vendor' && !storeName) {
      return res.status(400).json({ success: false, message: 'Store name is required for vendor registration' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: finalRole,
      phone,
    });

    // Vendor accounts start pending admin approval
    if (finalRole === 'vendor') {
      await VendorProfile.create({
        user: user._id,
        storeName,
        storeDescription,
        approvalStatus: 'pending',
      });
    }

    // Customers get an empty cart/wishlist ready to use
    if (finalRole === 'customer') {
      await Cart.create({ user: user._id, items: [] });
      await Wishlist.create({ user: user._id, products: [] });
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact support.' });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
  }
};

// @desc    Get currently logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    let vendorProfile = null;
    if (user.role === 'vendor') {
      vendorProfile = await VendorProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        vendorProfile,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching profile', error: error.message });
  }
};

module.exports = { register, login, getMe };