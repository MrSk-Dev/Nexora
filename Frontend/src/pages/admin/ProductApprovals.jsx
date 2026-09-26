import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

const ProductApprovals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/products/admin/all');
      setProducts(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleApprove = async (productId) => {
    try {
      await axiosInstance.put(`/products/admin/${productId}/approve`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve product');
    }
  };

  const handleReject = async (productId) => {
    const reason = window.prompt('Reason for rejection (optional):');
    try {
      await axiosInstance.put(`/products/admin/${productId}/reject`, { reason });
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject product');
    }
  };

  const handleDeactivate = async (productId) => {
    try {
      await axiosInstance.put(`/products/admin/${productId}/deactivate`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate product');
    }
  };

  const handleActivate = async (productId) => {
    try {
      await axiosInstance.put(`/products/admin/${productId}/activate`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to activate product');
    }
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p className="storefront-error">{error}</p>;

  const pending = products.filter((p) => p.approvalStatus === 'pending');
  const live = products.filter((p) => p.approvalStatus === 'approved' && p.isActive);
  const deactivated = products.filter((p) => p.approvalStatus === 'approved' && !p.isActive);
  const rejected = products.filter((p) => p.approvalStatus === 'rejected');

  const renderCard = (product, actions) => (
    <div key={product._id} className="approval-card">
      <img
        src={product.images?.[0] ? `http://localhost:5000${product.images[0]}` : 'https://via.placeholder.com/100'}
        alt={product.name}
        className="approval-product-image"
      />
      <div className="approval-card-info">
        <h3>{product.name}</h3>
        <p className="approval-meta">Category: {product.category?.name} | Price: ₹{product.price}</p>
        <p className="approval-meta">Vendor: {product.vendor?.name} ({product.vendor?.email})</p>
      </div>
      <div className="approval-card-actions">{actions}</div>
    </div>
  );

  return (
    <div className="approvals-page">
      <h1 className="cart-title">Product Management</h1>

      <h2 className="checkout-section-title">Pending Approval ({pending.length})</h2>
      {pending.length === 0 ? <p>No pending products.</p> : (
        <div className="approval-cards">
          {pending.map((p) => renderCard(p, (
            <>
              <button onClick={() => handleApprove(p._id)} className="approve-btn">Approve</button>
              <button onClick={() => handleReject(p._id)} className="reject-btn">Reject</button>
            </>
          )))}
        </div>
      )}

      <h2 className="checkout-section-title" style={{ marginTop: '30px' }}>Live on Storefront ({live.length})</h2>
      {live.length === 0 ? <p>No live products.</p> : (
        <div className="approval-cards">
          {live.map((p) => renderCard(p, (
            <button onClick={() => handleDeactivate(p._id)} className="reject-btn">Deactivate</button>
          )))}
        </div>
      )}

      {deactivated.length > 0 && (
        <>
          <h2 className="checkout-section-title" style={{ marginTop: '30px' }}>Deactivated ({deactivated.length})</h2>
          <div className="approval-cards">
            {deactivated.map((p) => renderCard(p, (
              <button onClick={() => handleActivate(p._id)} className="approve-btn">Reactivate</button>
            )))}
          </div>
        </>
      )}

      {rejected.length > 0 && (
        <>
          <h2 className="checkout-section-title" style={{ marginTop: '30px' }}>Rejected ({rejected.length})</h2>
          <div className="approval-cards">
            {rejected.map((p) => renderCard(p, null))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductApprovals;