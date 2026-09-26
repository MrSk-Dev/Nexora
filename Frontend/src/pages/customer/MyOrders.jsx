import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const statusColors = {
  placed: '#f0ad4e',
  processing: '#5bc0de',
  shipped: '#0275d8',
  delivered: '#5cb85c',
  cancelled: '#d9534f',
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const justPlacedId = location.state?.justPlaced;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/orders/mine');
        setOrders(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <p>Loading your orders...</p>;
  if (error) return <p className="storefront-error">{error}</p>;

  if (orders.length === 0) {
    return <p>You haven't placed any orders yet.</p>;
  }

  return (
    <div className="orders-page">
      <h1 className="cart-title">My Orders</h1>

      {justPlacedId && (
        <div className="order-success-banner">
          ✓ Order placed successfully!
        </div>
      )}

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-card-header">
              <span className="order-id">Order #{order._id.slice(-8).toUpperCase()}</span>
              <span
                className="order-status-badge"
                style={{ backgroundColor: statusColors[order.status] || '#999' }}
              >
                {order.status.toUpperCase()}
              </span>
            </div>

            <p className="order-date">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>

            <div className="order-items">
              {order.items.map((item, idx) => (
                <div key={idx} className="order-item-row">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="order-card-footer">
              <span>
                Shipping to: {order.shippingAddress.city}, {order.shippingAddress.state}
              </span>
              <strong>Total: ₹{order.itemsTotal}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;