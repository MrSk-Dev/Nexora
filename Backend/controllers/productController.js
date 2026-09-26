const Product = require('../models/Product');

// @desc    Create a new product (vendor)
// @route   POST /api/products
// @access  Private (vendor, approved)
const createProduct = async (req, res) => {
  console.log('--- [createProduct] called ---');
  console.log('req.user:', req.user?._id, req.user?.role);
  console.log('req.body:', req.body);
  console.log('req.files:', req.files?.length || 0, 'file(s)');

  try {
    const { name, description, category, price, discountPrice, stock } = req.body;

    if (!name || !description || !category || !price) {
      console.log('[createProduct] Missing required fields');
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const imagePaths = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : [];
    console.log('[createProduct] imagePaths:', imagePaths);

    const product = await Product.create({
      vendor: req.user._id,
      name,
      description,
      category,
      price,
      discountPrice,
      stock,
      images: imagePaths,
      approvalStatus: 'pending',
    });

    console.log('[createProduct] Product created:', product._id);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('[createProduct] ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Server error creating product', error: error.message });
  }
};

// @desc    Get all approved, active products (public storefront) with search/filter
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  console.log('--- [getProducts] called ---');
  console.log('req.query:', req.query);

  try {
    const { keyword, category, minPrice, maxPrice, vendor, page = 1, limit = 12 } = req.query;

    const filter = { approvalStatus: 'approved', isActive: true };

    if (keyword) filter.$text = { $search: keyword };
    if (category) filter.category = category;
    if (vendor) filter.vendor = vendor;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    console.log('[getProducts] filter:', filter);

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.max(Number(limit), 1);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .populate('vendor', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    console.log(`[getProducts] Found ${products.length} of ${total} total`);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: products,
    });
  } catch (error) {
    console.error('[getProducts] ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching products', error: error.message });
  }
};

// @desc    Get a single product by ID (public)
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  console.log('--- [getProductById] called ---');
  console.log('req.params.id:', req.params.id);

  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('vendor', 'name');

    if (!product) {
      console.log('[getProductById] Product not found in DB');
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const isOwner = req.user && String(product.vendor._id) === String(req.user._id);
    const isAdmin = req.user && req.user.role === 'admin';
    console.log('[getProductById] isOwner:', !!isOwner, 'isAdmin:', !!isAdmin, 'status:', product.approvalStatus);

    if (!isOwner && !isAdmin && (product.approvalStatus !== 'approved' || !product.isActive)) {
      console.log('[getProductById] Blocked - not approved/active and no owner/admin bypass');
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error('[getProductById] ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching product', error: error.message });
  }
};

// @desc    Get all products belonging to the logged-in vendor
// @route   GET /api/products/vendor/mine
// @access  Private (vendor)
const getMyProducts = async (req, res) => {
  console.log('--- [getMyProducts] called ---');
  console.log('req.user:', req.user?._id);

  try {
    const products = await Product.find({ vendor: req.user._id })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    console.log(`[getMyProducts] Found ${products.length} product(s)`);
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error('[getMyProducts] ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching vendor products', error: error.message });
  }
};

// @desc    Update a product (vendor, own product only)
// @route   PUT /api/products/:id
// @access  Private (vendor, approved)
const updateProduct = async (req, res) => {
  console.log('--- [updateProduct] called ---');
  console.log('req.params.id:', req.params.id, 'req.user:', req.user?._id);
  console.log('req.body:', req.body);

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      console.log('[updateProduct] Product not found');
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (String(product.vendor) !== String(req.user._id)) {
      console.log('[updateProduct] Ownership mismatch. product.vendor:', product.vendor, 'req.user._id:', req.user._id);
      return res.status(403).json({ success: false, message: 'Not authorized to update this product' });
    }

    const { name, description, category, price, discountPrice, stock, isActive } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (price !== undefined) product.price = price;
    if (discountPrice !== undefined) product.discountPrice = discountPrice;
    if (stock !== undefined) product.stock = stock;
    if (isActive !== undefined) product.isActive = isActive;

    if (req.files && req.files.length > 0) {
      console.log('[updateProduct] Replacing images with', req.files.length, 'new file(s)');
      product.images = req.files.map((file) => `/uploads/${file.filename}`);
    }

    product.approvalStatus = 'pending';
    product.rejectionReason = undefined;

    const updatedProduct = await product.save();
    console.log('[updateProduct] Product updated:', updatedProduct._id);

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error('[updateProduct] ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating product', error: error.message });
  }
};

// @desc    Delete a product (vendor, own product only)
// @route   DELETE /api/products/:id
// @access  Private (vendor, approved)
const deleteProduct = async (req, res) => {
  console.log('--- [deleteProduct] called ---');
  console.log('req.params.id:', req.params.id, 'req.user:', req.user?._id);

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      console.log('[deleteProduct] Product not found');
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (String(product.vendor) !== String(req.user._id)) {
      console.log('[deleteProduct] Ownership mismatch');
      return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
    }

    await product.deleteOne();
    console.log('[deleteProduct] Deleted:', req.params.id);

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('[deleteProduct] ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting product', error: error.message });
  }
};

// @desc    Get all pending products awaiting approval (admin)
// @route   GET /api/products/admin/pending
// @access  Private (admin)
const getPendingProducts = async (req, res) => {
  console.log('--- [getPendingProducts] called by admin:', req.user?._id, '---');

  try {
    const products = await Product.find({ approvalStatus: 'pending' })
      .populate('category', 'name slug')
      .populate('vendor', 'name email')
      .sort({ createdAt: 1 });

    console.log(`[getPendingProducts] Found ${products.length} pending product(s)`);
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error('[getPendingProducts] ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching pending products', error: error.message });
  }
};

// @desc    Approve a product (admin)
// @route   PUT /api/products/admin/:id/approve
// @access  Private (admin)
const approveProduct = async (req, res) => {
  console.log('--- [approveProduct] called for id:', req.params.id, 'by admin:', req.user?._id, '---');

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      console.log('[approveProduct] Product not found');
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.approvalStatus = 'approved';
    product.rejectionReason = undefined;
    await product.save();

    console.log('[approveProduct] Approved:', product._id);
    res.status(200).json({ success: true, message: 'Product approved', data: product });
  } catch (error) {
    console.error('[approveProduct] ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Server error approving product', error: error.message });
  }
};

// @desc    Reject a product (admin)
// @route   PUT /api/products/admin/:id/reject
// @access  Private (admin)
const rejectProduct = async (req, res) => {
  console.log('--- [rejectProduct] called for id:', req.params.id, 'by admin:', req.user?._id, '---');
  console.log('reason:', req.body.reason);

  try {
    const { reason } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      console.log('[rejectProduct] Product not found');
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.approvalStatus = 'rejected';
    product.rejectionReason = reason || 'Did not meet listing guidelines';
    await product.save();

    console.log('[rejectProduct] Rejected:', product._id);
    res.status(200).json({ success: true, message: 'Product rejected', data: product });
  } catch (error) {
    console.error('[rejectProduct] ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Server error rejecting product', error: error.message });
  }
};

// @desc    Deactivate an approved product (admin) — pulls it from storefront without rejecting
// @route   PUT /api/products/admin/:id/deactivate
// @access  Private (admin)
const deactivateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.isActive = false;
    await product.save();

    res.status(200).json({ success: true, message: 'Product deactivated', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deactivating product', error: error.message });
  }
};

// @desc    Reactivate a deactivated product (admin)
// @route   PUT /api/products/admin/:id/activate
// @access  Private (admin)
const activateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.isActive = true;
    await product.save();

    res.status(200).json({ success: true, message: 'Product activated', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error activating product', error: error.message });
  }
};

// @desc    Get all products (any status) — for admin management view
// @route   GET /api/products/admin/all
// @access  Private (admin)
const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category', 'name slug')
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching products', error: error.message });
  }
};

module.exports = {
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
};