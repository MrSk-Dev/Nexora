import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Cart = () => {
  const { cart, updateCartItem, removeFromCart, loading } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = async (productId, newQty) => {
    if (newQty < 1) return;
    try {
      await updateCartItem(productId, newQty);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove item');
    }
  };

  const items = cart.items || [];

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const total = items.reduce((sum, item) => {
    const price = item.product?.discountPrice || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const savings = subtotal - total;

  if (loading) return <p>Loading cart...</p>;

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <p>Your cart is empty.</p>
        <button onClick={() => navigate('/')} className="auth-button" style={{ width: 'auto', padding: '10px 20px' }}>
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-title">Your Cart</h1>

      <div className="cart-page-grid">
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.product._id} className="cart-item">
              <img
                src={item.product.images?.[0] ? `http://localhost:5000${item.product.images[0]}` : 'https://via.placeholder.com/80'}
                alt={item.product.name}
                className="cart-item-image"
              />
              <div className="cart-item-info">
                <h3 className="cart-item-name">{item.product.name}</h3>
                <p className="cart-item-price">
                  ₹{item.product.discountPrice || item.product.price}
                </p>
              </div>
              <div className="cart-item-qty">
                <button onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}>+</button>
              </div>
              <p className="cart-item-subtotal">
                ₹{(item.product.discountPrice || item.product.price) * item.quantity}
              </p>
              <button onClick={() => handleRemove(item.product._id)} className="cart-item-remove">
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary-card checkout-summary">
          <h2 className="checkout-section-title">Order Summary</h2>

          <div className="checkout-summary-item">
            <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
            <span>₹{subtotal}</span>
          </div>

          {savings > 0 && (
            <div className="checkout-summary-item">
              <span>Savings</span>
              <span>-₹{savings}</span>
            </div>
          )}

          <div className="checkout-summary-item">
            <span>Delivery</span>
            <span>FREE</span>
          </div>

          <div className="checkout-summary-total">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          <button onClick={() => navigate('/checkout')} className="checkout-btn">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;