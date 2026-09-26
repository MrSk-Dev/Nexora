import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

const VendorApprovals = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/vendors/admin/all');
      setVendors(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleApprove = async (vendorProfileId) => {
    try {
      await axiosInstance.put(`/vendors/admin/${vendorProfileId}/approve`);
      fetchVendors();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve vendor');
    }
  };

  const handleReject = async (vendorProfileId) => {
    const reason = window.prompt('Reason for rejection (optional):');
    try {
      await axiosInstance.put(`/vendors/admin/${vendorProfileId}/reject`, { reason });
      fetchVendors();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject vendor');
    }
  };

  const handleSuspend = async (vendorProfileId) => {
    const reason = window.prompt('Reason for suspension (optional):');
    try {
      await axiosInstance.put(`/vendors/admin/${vendorProfileId}/suspend`, { reason });
      fetchVendors();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to suspend vendor');
    }
  };

  const handleReactivate = async (vendorProfileId) => {
    try {
      await axiosInstance.put(`/vendors/admin/${vendorProfileId}/reactivate`);
      fetchVendors();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reactivate vendor');
    }
  };

  if (loading) return <p>Loading vendors...</p>;
  if (error) return <p className="storefront-error">{error}</p>;

  const pending = vendors.filter((v) => v.approvalStatus === 'pending');
  const approved = vendors.filter((v) => v.approvalStatus === 'approved');
  const suspended = vendors.filter((v) => v.approvalStatus === 'suspended');
  const rejected = vendors.filter((v) => v.approvalStatus === 'rejected');

  return (
    <div className="approvals-page">
      <h1 className="cart-title">Vendor Management</h1>

      <h2 className="checkout-section-title">Pending Approval ({pending.length})</h2>
      {pending.length === 0 ? (
        <p>No pending vendor approvals.</p>
      ) : (
        <div className="approval-cards">
          {pending.map((vendor) => (
            <div key={vendor._id} className="approval-card">
              <div className="approval-card-info">
                <h3>{vendor.storeName}</h3>
                <p>{vendor.storeDescription || 'No description provided.'}</p>
                <p className="approval-meta">Owner: {vendor.user?.name} ({vendor.user?.email})</p>
                <p className="approval-meta">Applied on {new Date(vendor.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="approval-card-actions">
                <button onClick={() => handleApprove(vendor._id)} className="approve-btn">Approve</button>
                <button onClick={() => handleReject(vendor._id)} className="reject-btn">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="checkout-section-title" style={{ marginTop: '30px' }}>Active Vendors ({approved.length})</h2>
      {approved.length === 0 ? (
        <p>No approved vendors yet.</p>
      ) : (
        <div className="approval-cards">
          {approved.map((vendor) => (
            <div key={vendor._id} className="approval-card">
              <div className="approval-card-info">
                <h3>{vendor.storeName}</h3>
                <p className="approval-meta">Owner: {vendor.user?.name} ({vendor.user?.email})</p>
              </div>
              <div className="approval-card-actions">
                <button onClick={() => handleSuspend(vendor._id)} className="reject-btn">Suspend</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {suspended.length > 0 && (
        <>
          <h2 className="checkout-section-title" style={{ marginTop: '30px' }}>Suspended Vendors ({suspended.length})</h2>
          <div className="approval-cards">
            {suspended.map((vendor) => (
              <div key={vendor._id} className="approval-card">
                <div className="approval-card-info">
                  <h3>{vendor.storeName}</h3>
                  <p className="approval-meta">Owner: {vendor.user?.name} ({vendor.user?.email})</p>
                  {vendor.rejectionReason && <p className="approval-meta">Reason: {vendor.rejectionReason}</p>}
                </div>
                <div className="approval-card-actions">
                  <button onClick={() => handleReactivate(vendor._id)} className="approve-btn">Reactivate</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {rejected.length > 0 && (
        <>
          <h2 className="checkout-section-title" style={{ marginTop: '30px' }}>Rejected ({rejected.length})</h2>
          <div className="approval-cards">
            {rejected.map((vendor) => (
              <div key={vendor._id} className="approval-card">
                <div className="approval-card-info">
                  <h3>{vendor.storeName}</h3>
                  <p className="approval-meta">Owner: {vendor.user?.name} ({vendor.user?.email})</p>
                  {vendor.rejectionReason && <p className="approval-meta">Reason: {vendor.rejectionReason}</p>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default VendorApprovals;