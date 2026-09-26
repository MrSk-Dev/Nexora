import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { savePendingAction } from '../../utils/pendingAction';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axiosInstance.get(`/products/${id}`);
        setProduct(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      savePendingAction({ type: 'addToCart', productId: product._id, quantity });
      navigate('/login');
      return;
    }

    try {
      await addToCart(product._id, quantity);
      alert('Added to cart!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      savePendingAction({ type: 'buyNow', productId: product._id, quantity });
      navigate('/login');
      return;
    }

    navigate('/checkout', { state: { buyNow: { productId: product._id, quantity } } });
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Wishlist action failed');
    }
  };

  if (loading) return <p>Loading product...</p>;
  if (error) return <p className="storefront-error">{error}</p>;
  if (!product) return null;

  const inWishlist = isAuthenticated && isInWishlist(product._id);

  return (
    <div className="product-detail">
      <button onClick={() => navigate(-1)} className="back-button">← Back</button>

      <div className="product-detail-grid">
        <div className="product-detail-images">
          <img
            src={product.images?.[0] ? `http://localhost:5000${product.images[0]}` : 'https://via.placeholder.com/400'}
            alt={product.name}
            className="product-detail-main-image"
          />
        </div>

        <div className="product-detail-info">
          <h1 className="product-detail-name">{product.name}</h1>
          <p className="product-detail-vendor">Sold by {product.vendor?.name}</p>
          <p className="product-detail-category">{product.category?.name}</p>

          <div className="product-detail-price-row">
            <span className="product-detail-price">₹{product.discountPrice || product.price}</span>
            {product.discountPrice && (
              <span className="product-detail-original-price">₹{product.price}</span>
            )}
          </div>

          <p className="product-detail-stock">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>

          <p className="product-detail-description">{product.description}</p>

          <div className="product-detail-actions">
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="product-detail-qty-input"
            />
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="buy-now-btn"
            >
              Buy Now
            </button>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="product-add-btn"
            >
              Add to Cart
            </button>
            <button onClick={handleWishlistToggle} className="wishlist-toggle-btn">
              {inWishlist ? '♥ Remove from Wishlist' : '♡ Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;