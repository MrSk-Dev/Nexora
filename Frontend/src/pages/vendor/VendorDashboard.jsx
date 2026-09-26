import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const VendorDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileRes, productsRes] = await Promise.all([
          axiosInstance.get('/vendors/me'),
          axiosInstance.get('/products/vendor/mine'),
        ]);
        setProfile(profileRes.data.data);
        setProducts(productsRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="storefront-error">{error}</p>;

  const approvedCount = products.filter((p) => p.approvalStatus === 'approved').length;
  const pendingCount = products.filter((p) => p.approvalStatus === 'pending').length;
  const rejectedCount = products.filter((p) => p.approvalStatus === 'rejected').length;

  return (
    <div className="dashboard-page">
      <h1 className="cart-title">Vendor Dashboard</h1>

      {profile?.approvalStatus !== 'approved' && (
        <div className={`vendor-status-banner vendor-status-${profile?.approvalStatus}`}>
          Your vendor account is currently <strong>{profile?.approvalStatus}</strong>.
          {profile?.approvalStatus === 'pending' && ' You cannot list products until an admin approves your account.'}
          {profile?.approvalStatus === 'rejected' && ` Reason: ${profile?.rejectionReason || 'Not specified'}`}
        </div>
      )}

      <div className="dashboard-stats">
        <div className="dashboard-stat-card">
          <span className="dashboard-stat-number">{products.length}</span>
          <span className="dashboard-stat-label">Total Products</span>
        </div>
        <div className="dashboard-stat-card">
          <span className="dashboard-stat-number">{approvedCount}</span>
          <span className="dashboard-stat-label">Approved</span>
        </div>
        <div className="dashboard-stat-card">
          <span className="dashboard-stat-number">{pendingCount}</span>
          <span className="dashboard-stat-label">Pending</span>
        </div>
        <div className="dashboard-stat-card">
          <span className="dashboard-stat-number">{rejectedCount}</span>
          <span className="dashboard-stat-label">Rejected</span>
        </div>
      </div>

      <div className="dashboard-store-info">
        <h2 className="checkout-section-title">Store Info</h2>
        <p><strong>{profile?.storeName}</strong></p>
        <p>{profile?.storeDescription || 'No description yet.'}</p>
      </div>

      <div className="dashboard-actions">
        <Link to="/vendor/products/new" className="auth-button" style={{ display: 'inline-block', width: 'auto', padding: '10px 20px', textDecoration: 'none' }}>
          + Add New Product
        </Link>
        <Link to="/vendor/products" style={{ marginLeft: '15px' }}>
          View All My Products →
        </Link>
      </div>
    </div>
  );
};

export default VendorDashboard;