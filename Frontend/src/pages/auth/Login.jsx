import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import { getPendingAction, clearPendingAction } from '../../utils/pendingAction';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);

      const pending = getPendingAction();

      if (pending && user.role === 'customer') {
        clearPendingAction();

        if (pending.type === 'addToCart') {
          try {
            await axiosInstance.post('/cart', {
              productId: pending.productId,
              quantity: pending.quantity || 1,
            });
            navigate('/cart');
            return;
          } catch (err) {
            // If resuming the action fails (e.g. product no longer available),
            // fall through to normal redirect instead of leaving the user stuck.
            console.error('Failed to resume pending action:', err.message);
          }
        }

       if (pending.type === 'buyNow') {
          navigate('/checkout', {
            state: { buyNow: { productId: pending.productId, quantity: pending.quantity || 1 } },
          });
          return;
        }

        if (pending.type === 'becomeVendor') {
          navigate('/vendor-register');
          return;
        }
      }

      // Default role-based redirect when there's no pending action to resume
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'vendor') navigate('/vendor');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2 className="auth-title">Login to Nexora</h2>

        {error && <div className="auth-error">{error}</div>}

        <label className="auth-label">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="auth-input"
          placeholder="you@example.com"
        />

        <label className="auth-label">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="auth-input"
          placeholder="••••••••"
        />

        <button type="submit" disabled={loading} className="auth-button">
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="auth-footer-text">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;