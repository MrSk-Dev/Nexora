const User = require('../models/User');
const VendorProfile = require('../models/VendorProfile');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get dashboard summary stats for admin
// @route   GET /api/admin/dashboard
// @access  Private (admin)
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalCustomers,
      totalVendors,
      pendingVendors,
      totalProducts,
      pendingProducts,
      totalOrders,
      revenueAgg,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'vendor' }),
      VendorProfile.countDocuments({ approvalStatus: 'pending' }),
      Product.countDocuments(),
      Product.countDocuments({ approvalStatus: 'pending' }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$itemsTotal' } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        totalVendors,
        pendingVendors,
        totalProducts,
        pendingProducts,
        totalOrders,
        totalRevenue: revenueAgg[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching dashboard stats', error: error.message });
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private (admin)
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching users', error: error.message });
  }
};

// @desc    Activate or deactivate a user account
// @route   PUT /api/admin/users/:id/status
// @access  Private (admin)
const toggleUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot deactivate an admin account' });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({ success: true, message: `User ${isActive ? 'activated' : 'deactivated'}`, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating user status', error: error.message });
  }
};

module.exports = { getDashboardStats, getAllUsers, toggleUserStatus };