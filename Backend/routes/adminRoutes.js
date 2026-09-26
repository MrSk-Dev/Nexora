const express = require('express');
const router = express.Router();

const { getDashboardStats, getAllUsers, toggleUserStatus } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/status', toggleUserStatus);

module.exports = router;