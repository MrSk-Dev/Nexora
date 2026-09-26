import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const EditProduct = () => {
  const { id } = useParams();
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
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoriesRes] = await Promise.all([
          axiosInstance.get(`/products/${id}`),
          axiosInstance.get('/categories'),
        ]);

        const product = productRes.data.data;
        setFormData({
          name: product.name || '',
          description: product.description || '',
          category: product.category?._id || '',
          price: product.price || '',
          discountPrice: product.discountPrice || '',
          stock: product.stock || '',
        });
        setExistingImages(product.images || []);
        setCategories(categoriesRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

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

    setSaving(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('price', formData.price);
      if (formData.discountPrice) data.append('discountPrice', formData.discountPrice);
      data.append('stock', formData.stock);

      // Only send new images if the vendor selected replacement files;
      // otherwise the backend keeps the existing images untouched
      images.forEach((file) => data.append('images', file));

      await axiosInstance.put(`/products/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/vendor/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading product...</p>;

  return (
    <div className="form-page">
      <h1 className="cart-title">Edit Product</h1>

      <form onSubmit={handleSubmit} className="product-form">
        {error && <div className="auth-error">{error}</div>}

        <p className="form-hint">
          Editing this product will resubmit it for admin approval before it goes live again.
        </p>

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
            <label className="auth-label">Discount Price (final sale price, optional)</label>
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

        {existingImages.length > 0 && (
          <p className="form-hint">Current images: {existingImages.length} — upload new ones below only if you want to replace them.</p>
        )}

        <label className="auth-label">Replace Images (optional, up to 5)</label>
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleImageChange}
          className="auth-input"
        />
        {images.length > 0 && <p className="form-hint">{images.length} new file(s) selected</p>}

        <button type="submit" disabled={saving} className="auth-button">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditProduct;