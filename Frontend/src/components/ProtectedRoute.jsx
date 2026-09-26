import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleHome = {
  admin: '/admin',
  vendor: '/vendor',
  customer: '/',
};

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log('Protected Route redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={roleHome[user.role] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;