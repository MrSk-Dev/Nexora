import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useCart } from '../../context/CartContext';

const Checkout = () => {
  const { cart, clearCart, fetchCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const buyNowRequest = location.state?.buyNow; // { productId, quantity } or undefined

  const [buyNowProduct, setBuyNowProduct] = useState(null);
  const [buyNowLoading, setBuyNowLoading] = useState(!!buyNowRequest);

  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // In "Buy Now" mode, fetch just that one product's current details
  useEffect(() => {
    if (!buyNowRequest) return;

    const fetchProduct = async () => {
      try {
        const res = await axiosInstance.get(`/products/${buyNowRequest.productId}`);
        setBuyNowProduct(res.data.data);
      } catch (err) {
        setError('The product you selected is no longer available.');
      } finally {
        setBuyNowLoading(false);
      }
    };
    fetchProduct();
  }, [buyNowRequest]);

  const isBuyNowMode = !!buyNowRequest;

  const items = isBuyNowMode
    ? buyNowProduct
      ? [{ product: buyNowProduct, quantity: buyNowRequest.quantity }]
      : []
    : cart.items || [];

  const total = items.reduce((sum, item) => {
    const price = item.product?.discountPrice || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const handleChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isBuyNowMode) {
        // Buy Now: add just this item to cart, place order, then restore cart to what it was before
        // (backend order endpoint always checks out the current cart, so we use it as a
        // temporary single-item cart, then clear it — cleanest way to reuse existing order logic)
        await axiosInstance.post('/cart', {
          productId: buyNowRequest.productId,
          quantity: buyNowRequest.quantity,
        });
      }

      const res = await axiosInstance.post('/orders', { shippingAddress });
      await clearCart();
      await fetchCart();
      navigate('/orders', { state: { justPlaced: res.data.data._id } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (buyNowLoading) {
    return <p>Loading...</p>;
  }

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <p>{isBuyNowMode ? 'This product is no longer available.' : 'Your cart is empty. Add items before checking out.'}</p>
        <button onClick={() => navigate('/')} className="auth-button" style={{ width: 'auto', padding: '10px 20px' }}>
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1 className="cart-title">Checkout</h1>

      <div className="checkout-grid">
        <form onSubmit={handlePlaceOrder} className="checkout-form">
          <h2 className="checkout-section-title">Shipping Address</h2>

          {error && <div className="auth-error">{error}</div>}

          <label className="auth-label">Street</label>
          <input
            type="text"
            name="street"
            value={shippingAddress.street}
            onChange={handleChange}
            required
            className="auth-input"
          />

          <label className="auth-label">City</label>
          <input
            type="text"
            name="city"
            value={shippingAddress.city}
            onChange={handleChange}
            required
            className="auth-input"
          />

          <label className="auth-label">State</label>
          <input
            type="text"
            name="state"
            value={shippingAddress.state}
            onChange={handleChange}
            required
            className="auth-input"
          />

          <label className="auth-label">Postal Code</label>
          <input
            type="text"
            name="postalCode"
            value={shippingAddress.postalCode}
            onChange={handleChange}
            required
            className="auth-input"
          />

          <label className="auth-label">Postal Code</label>
          <input
            type="text"
            name="postalCode"
            value={shippingAddress.postalCode}
            onChange={(e) => {
              const numbersOnly = e.target.value.replace(/\D/g, '').slice(0, 6);
              setShippingAddress({ ...shippingAddress, postalCode: numbersOnly });
            }}
            required
            pattern="[0-9]{6}"
            inputMode="numeric"
            maxLength={6}
            className="auth-input"
            placeholder="6-digit PIN code"
          />

          <p className="checkout-payment-note">Payment method: <strong>Cash on Delivery</strong></p>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Placing order...' : `Place Order (₹${total})`}
          </button>
        </form>

        <div className="checkout-summary">
          <h2 className="checkout-section-title">Order Summary</h2>
          {items.map((item) => (
            <div key={item.product._id} className="checkout-summary-item">
              <span>{item.product.name} × {item.quantity}</span>
              <span>₹{(item.product.discountPrice || item.product.price) * item.quantity}</span>
            </div>
          ))}
          <div className="checkout-summary-total">
            <strong>Total</strong>
            <strong>₹{total}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;