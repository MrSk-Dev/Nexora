const Category = require('../models/Category');

// @desc    Create category
// @route   POST /api/categories
// @access  Private (admin)
const createCategory = async (req, res) => {
  console.log('--- [createCategory] called ---');
  console.log('req.body:', req.body);

  try {
    const { name, description, parentCategory } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const exists = await Category.findOne({ name: name.trim() });
    if (exists) return res.status(400).json({ success: false, message: 'Category already exists' });

    const category = await Category.create({ name, description, parentCategory: parentCategory || null });
    console.log('[createCategory] Created:', category);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error('[createCategory] ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error creating category', error: error.message });
  }
};

// @desc    Get all active categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching categories', error: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (admin)
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const { name, description, parentCategory, isActive } = req.body;
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (parentCategory !== undefined) category.parentCategory = parentCategory;
    if (isActive !== undefined) category.isActive = isActive;

    const updated = await category.save();
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating category', error: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (admin)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    await category.deleteOne();
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting category', error: error.message });
  }
};

module.exports = { createCategory, getCategories, updateCategory, deleteCategory };