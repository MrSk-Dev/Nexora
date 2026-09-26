import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

const statusColors = {
  placed: '#f0ad4e',
  processing: '#5bc0de',
  shipped: '#0275d8',
  delivered: '#5cb85c',
  cancelled: '#d9534f',
};

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/orders');
        setOrders(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className="storefront-error">{error}</p>;

  if (orders.length === 0) {
    return <p>No orders placed yet.</p>;
  }

  return (
    <div className="orders-page">
      <h1 className="cart-title">All Orders</h1>

      <table className="products-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>#{order._id.slice(-8).toUpperCase()}</td>
              <td>{order.customer?.name} <br /><small>{order.customer?.email}</small></td>
              <td>{order.items.length} item(s)</td>
              <td>₹{order.itemsTotal}</td>
              <td>
                <span
                  className="status-badge"
                  style={{ backgroundColor: statusColors[order.status] || '#999' }}
                >
                  {order.status}
                </span>
              </td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllOrders;