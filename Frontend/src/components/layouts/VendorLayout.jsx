import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

const VendorLayout = () => {
  const { user } = useAuth();

const handleLogout = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('nexora_splash_shown');
  window.location.href = '/';
};

  return (
    <div>
      <nav className="app-nav">
        <Link to="/vendor" className="app-nav-brand">
          <img src={logo} alt="Nexora" className="app-nav-logo" />
          Nexora
        </Link>
        <div className="app-nav-links">
          <Link to="/vendor" className="app-nav-link">Dashboard</Link>
          <Link to="/vendor/products" className="app-nav-link">My Products</Link>
          <Link to="/vendor/products/new" className="app-nav-link">Add Product</Link>
          <Link to="/vendor/orders" className="app-nav-link">Orders</Link>
          <Link to="/vendor/profile" className="app-nav-link">Store Profile</Link>
          <span className="app-nav-username">Hi, {user?.name}</span>
          <button onClick={handleLogout} className="app-nav-logout-btn">Logout</button>
        </div>
      </nav>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};

export default VendorLayout;