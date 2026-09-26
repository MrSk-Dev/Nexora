import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const VendorRegister = () => {
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  // If this user already has a vendor account, no need to apply again
  if (user?.role === 'vendor') {
    navigate('/vendor', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!storeName.trim()) {
      setError('Store name is required');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/vendors/apply', { storeName, storeDescription });
      await refreshUser();
      navigate('/vendor');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit vendor application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2 className="auth-title">Sell on Nexora</h2>
        <p className="form-hint" style={{ marginBottom: '16px' }}>
          Tell us about your store. Your application will be reviewed by our team before you can start selling.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <label className="auth-label">Store Name</label>
        <input
          type="text"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          required
          className="auth-input"
          placeholder="Your store's name"
        />

        <label className="auth-label">Store Description (optional)</label>
        <input
          type="text"
          value={storeDescription}
          onChange={(e) => setStoreDescription(e.target.value)}
          className="auth-input"
          placeholder="What do you sell?"
        />

        <button type="submit" disabled={loading} className="auth-button">
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
};

export default VendorRegister;