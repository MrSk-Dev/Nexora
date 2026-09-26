import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import logo from '../../assets/logo.png';

const CustomerLayout = () => {
  const { user, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
 

const handleLogout = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('nexora_splash_shown');
  window.location.href = '/';
};

  return (
    <div>
      <nav className="app-nav">
        <Link to="/" className="app-nav-brand">
          <img src={logo} alt="Nexora" className="app-nav-logo" />
          Nexora
        </Link>
        <div className="app-nav-links">
          <Link to="/" className="app-nav-link">Shop</Link>
          {isAuthenticated ? (
            <>
              <Link to="/wishlist" className="app-nav-link">Wishlist</Link>
              <Link to="/cart" className="app-nav-link">Cart ({cartCount})</Link>
              <Link to="/orders" className="app-nav-link">My Orders</Link>
              <Link to="/vendor-register" className="app-nav-sell-btn">Sell on Nexora</Link>
              <span className="app-nav-username">Hi, {user?.name}</span>
              <button onClick={handleLogout} className="app-nav-logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="app-nav-link">Login</Link>
              <Link to="/register" className="app-nav-link">Register</Link>
              <button
                onClick={() => {
                  sessionStorage.setItem('nexora_pending_action', JSON.stringify({ type: 'becomeVendor' }));
                  window.location.href = '/login';
                }}
                className="app-nav-sell-btn"
              >
                Sell on Nexora
              </button>
            </>
          )}
        </div>
      </nav>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;