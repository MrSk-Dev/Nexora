import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { savePendingAction } from '../../utils/pendingAction';

const Storefront = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (keyword) params.keyword = keyword;
        if (selectedCategory) params.category = selectedCategory;

        const res = await axiosInstance.get('/products', { params });
        setProducts(res.data.data);
      } catch (err) {
        setError('Failed to load products: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, selectedCategory]);

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      savePendingAction({ type: 'addToCart', productId, quantity: 1 });
      navigate('/login');
      return;
    }

    try {
      await addToCart(productId, 1);
      alert('Added to cart!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  return (
    <div className="storefront">
      <div className="storefront-filters">
        <input
          type="text"
          placeholder="Search products..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="storefront-search"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="storefront-category-select"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {loading && <p>Loading products...</p>}
      {error && <p className="storefront-error">{error}</p>}
      {!loading && products.length === 0 && <p>No products found.</p>}

      <div className="product-grid">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            <Link to={`/products/${product._id}`}>
              <img
                src={product.images?.[0] ? `http://localhost:5000${product.images[0]}` : 'https://via.placeholder.com/200'}
                alt={product.name}
                className="product-image"
              />
              <h3 className="product-name">{product.name}</h3>
            </Link>
            <p className="product-price">
              ₹{product.discountPrice || product.price}
              {product.discountPrice && (
                <span className="product-original-price"> ₹{product.price}</span>
              )}
            </p>
            <p className="product-vendor">by {product.vendor?.name}</p>
            <button onClick={() => handleAddToCart(product._id)} className="product-add-btn">
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Storefront;