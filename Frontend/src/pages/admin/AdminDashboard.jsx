import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get('/admin/dashboard');
        setStats(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="storefront-error">{error}</p>;

  return (
    <div className="dashboard-page">
      <h1 className="cart-title">Admin Dashboard</h1>

      <div className="dashboard-stats">
        <div className="dashboard-stat-card">
          <span className="dashboard-stat-number">{stats.totalCustomers}</span>
          <span className="dashboard-stat-label">Customers</span>
        </div>
        <div className="dashboard-stat-card">
          <span className="dashboard-stat-number">{stats.totalVendors}</span>
          <span className="dashboard-stat-label">Vendors</span>
        </div>
        <div className="dashboard-stat-card dashboard-stat-alert">
          <span className="dashboard-stat-number">{stats.pendingVendors}</span>
          <span className="dashboard-stat-label">Pending Vendor Approvals</span>
        </div>
        <div className="dashboard-stat-card">
          <span className="dashboard-stat-number">{stats.totalProducts}</span>
          <span className="dashboard-stat-label">Total Products</span>
        </div>
        <div className="dashboard-stat-card dashboard-stat-alert">
          <span className="dashboard-stat-number">{stats.pendingProducts}</span>
          <span className="dashboard-stat-label">Pending Product Approvals</span>
        </div>
        <div className="dashboard-stat-card">
          <span className="dashboard-stat-number">{stats.totalOrders}</span>
          <span className="dashboard-stat-label">Total Orders</span>
        </div>
        <div className="dashboard-stat-card">
          <span className="dashboard-stat-number">₹{stats.totalRevenue}</span>
          <span className="dashboard-stat-label">Total Revenue</span>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/admin/vendors">Review Pending Vendors →</Link>
        <br /><br />
        <Link to="/admin/products">Review Pending Products →</Link>
      </div>
    </div>
  );
};

export default AdminDashboard;