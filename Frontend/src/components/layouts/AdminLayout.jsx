import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

const AdminLayout = () => {
  const { user } = useAuth();

const handleLogout = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('nexora_splash_shown');
  window.location.href = '/';
};
  return (
    <div>
      <nav className="app-nav">
        <Link to="/admin" className="app-nav-brand">
          <img src={logo} alt="Nexora" className="app-nav-logo" />
          Nexora
        </Link>
        <div className="app-nav-links">
          <Link to="/admin" className="app-nav-link">Dashboard</Link>
          <Link to="/admin/vendors" className="app-nav-link">Vendor Approvals</Link>
          <Link to="/admin/products" className="app-nav-link">Product Approvals</Link>
          <Link to="/admin/categories" className="app-nav-link">Categories</Link>
          <Link to="/admin/orders" className="app-nav-link">All Orders</Link>
          <Link to="/admin/users" className="app-nav-link">Users</Link>
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

export default AdminLayout;