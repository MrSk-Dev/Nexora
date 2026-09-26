import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove from wishlist');
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      alert('Added to cart!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const products = wishlist.products || [];

  if (loading) return <p>Loading wishlist...</p>;

  if (products.length === 0) {
    return <p>Your wishlist is empty.</p>;
  }

  return (
    <div className="wishlist-page">
      <h1 className="cart-title">My Wishlist</h1>

      <div className="product-grid">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            <Link to="/loading" state={{ destination: `/products/${product._id}` }}>
              <img
                src={product.images?.[0] ? `http://localhost:5000${product.images[0]}` : 'https://via.placeholder.com/200'}
                alt={product.name}
                className="product-image"
              />
              <h3 className="product-name">{product.name}</h3>
            </Link>
            <p className="product-price">₹{product.discountPrice || product.price}</p>
            <button onClick={() => handleAddToCart(product._id)} className="product-add-btn">
              Add to Cart
            </button>
            <button onClick={() => handleRemove(product._id)} className="wishlist-remove-btn">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;