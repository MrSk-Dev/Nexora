import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

const statusColors = {
  placed: '#f0ad4e',
  processing: '#5bc0de',
  shipped: '#0275d8',
  delivered: '#5cb85c',
  cancelled: '#d9534f',
};

const statusOptions = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/orders/vendor/mine');
      setOrders(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axiosInstance.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className="storefront-error">{error}</p>;

  if (orders.length === 0) {
    return <p>No orders containing your products yet.</p>;
  }

  return (
    <div className="orders-page">
      <h1 className="cart-title">Orders Containing My Products</h1>

      <div className="orders-list">
        {orders.map((order) => {
          // Only show items in this order that belong to the logged-in vendor
          const myItems = order.items;
          return (
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

              <p className="order-date">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>

              <div className="order-items">
                {myItems.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <span>Shipping to: {order.shippingAddress.city}, {order.shippingAddress.state}</span>
              </div>

              <div className="order-status-update">
                <label className="auth-label">Update Status:</label>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="auth-select"
                  style={{ width: 'auto', display: 'inline-block', marginLeft: '10px' }}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VendorOrders;