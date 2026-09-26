import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    phone: '',
    storeName: '',
    storeDescription: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.role === 'vendor' && !formData.storeName.trim()) {
      setError('Store name is required for vendor registration');
      return;
    }

    setLoading(true);
    try {
      const user = await register(formData);

      if (user.role === 'vendor') {
        // Vendors land on their dashboard, which will show pending-approval status
        navigate('/vendor');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2 className="auth-title">Create your Nexora account</h2>

        {error && <div className="auth-error">{error}</div>}

        <label className="auth-label">I am a</label>
        <select name="role" value={formData.role} onChange={handleChange} className="auth-select">
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
        </select>

        <label className="auth-label">Full Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="auth-input"
          placeholder="Your name"
        />

        <label className="auth-label">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="auth-input"
          placeholder="you@example.com"
        />

        <label className="auth-label">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
          className="auth-input"
          placeholder="At least 6 characters"
        />

        <label className="auth-label">Phone (optional)</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="auth-input"
          placeholder="Your phone number"
        />

        {formData.role === 'vendor' && (
          <>
            <label className="auth-label">Store Name</label>
            <input
              type="text"
              name="storeName"
              value={formData.storeName}
              onChange={handleChange}
              required
              className="auth-input"
              placeholder="Your store's name"
            />

            <label className="auth-label">Store Description (optional)</label>
            <input
              type="text"
              name="storeDescription"
              value={formData.storeDescription}
              onChange={handleChange}
              className="auth-input"
              placeholder="What do you sell?"
            />
          </>
        )}

        <button type="submit" disabled={loading} className="auth-button">
          {loading ? 'Creating account...' : 'Register'}
        </button>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;