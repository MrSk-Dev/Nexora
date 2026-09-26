import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

const StoreProfile = () => {
  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    businessEmail: '',
    businessPhone: '',
    gstNumber: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get('/vendors/me');
        const profile = res.data.data;
        setFormData({
          storeName: profile.storeName || '',
          storeDescription: profile.storeDescription || '',
          businessEmail: profile.businessEmail || '',
          businessPhone: profile.businessPhone || '',
          gstNumber: profile.gstNumber || '',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await axiosInstance.put('/vendors/me', formData);
      setSuccess('Store profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="form-page">
      <h1 className="cart-title">Store Profile</h1>

      <form onSubmit={handleSubmit} className="product-form">
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <label className="auth-label">Store Name</label>
        <input
          type="text"
          name="storeName"
          value={formData.storeName}
          onChange={handleChange}
          required
          className="auth-input"
        />

        <label className="auth-label">Store Description</label>
        <textarea
          name="storeDescription"
          value={formData.storeDescription}
          onChange={handleChange}
          rows={3}
          className="auth-input"
        />

        <label className="auth-label">Business Email</label>
        <input
          type="email"
          name="businessEmail"
          value={formData.businessEmail}
          onChange={handleChange}
          className="auth-input"
        />

        <label className="auth-label">Business Phone</label>
        <input
          type="text"
          name="businessPhone"
          value={formData.businessPhone}
          onChange={handleChange}
          className="auth-input"
        />

        <label className="auth-label">GST Number (optional)</label>
        <input
          type="text"
          name="gstNumber"
          value={formData.gstNumber}
          onChange={handleChange}
          className="auth-input"
        />

        <button type="submit" disabled={saving} className="auth-button">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default StoreProfile;