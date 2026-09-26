import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    discountPrice: '',
    stock: '',
  });
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get('/categories');
        setCategories(res.data.data);
      } catch (err) {
        console.error('Failed to load categories:', err.message);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files).slice(0, 5));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('price', formData.price);
      if (formData.discountPrice) data.append('discountPrice', formData.discountPrice);
      data.append('stock', formData.stock);

      images.forEach((file) => data.append('images', file));

      await axiosInstance.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/vendor/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <h1 className="cart-title">Add New Product</h1>

      <form onSubmit={handleSubmit} className="product-form">
        {error && <div className="auth-error">{error}</div>}

        <label className="auth-label">Product Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="auth-input"
        />

        <label className="auth-label">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="auth-input"
        />

        <label className="auth-label">Category</label>
        <select name="category" value={formData.category} onChange={handleChange} required className="auth-select">
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>

        <div className="form-row">
          <div>
            <label className="auth-label">Price (₹)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="auth-input"
            />
          </div>
          <div>
            <label className="auth-label">Discount Price (optional)</label>
            <input
              type="number"
              name="discountPrice"
              value={formData.discountPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="auth-input"
            />
          </div>
        </div>

        <label className="auth-label">Stock Quantity</label>
        <input
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          required
          min="0"
          className="auth-input"
        />

        <label className="auth-label">Product Images (up to 5)</label>
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleImageChange}
          className="auth-input"
        />
        {images.length > 0 && <p className="form-hint">{images.length} file(s) selected</p>}

        <p className="form-hint">Your product will be submitted for admin approval before going live.</p>

        <button type="submit" disabled={loading} className="auth-button">
          {loading ? 'Submitting...' : 'Submit Product'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;