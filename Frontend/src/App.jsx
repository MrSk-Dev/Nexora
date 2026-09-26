import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import ProtectedRoute from './components/ProtectedRoute';

import AppEntry from './components/AppEntry';

import CustomerLayout from './components/layouts/CustomerLayout';
import VendorLayout from './components/layouts/VendorLayout';
import AdminLayout from './components/layouts/AdminLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import ProductDetail from './pages/customer/ProductDetail';
import Storefront from './pages/customer/Storefront';
import Checkout from './pages/customer/Checkout';
import Cart from './pages/customer/Cart';
import MyOrders from './pages/customer/MyOrders';
import Wishlist from './pages/customer/Wishlist';
import VendorRegister from './pages/customer/VendorRegister';

import AddProduct from './pages/vendor/AddProduct';
import MyProducts from './pages/vendor/MyProducts';
import VendorOrders from './pages/vendor/VendorOrders';
import StoreProfile from './pages/vendor/StoreProfile';
import VendorDashboard from './pages/vendor/VendorDashboard';
import EditProduct from './pages/vendor/EditProduct';

import AdminDashboard from './pages/admin/AdminDashboard';
import VendorApprovals from './pages/admin/VendorApprovals';
import ProductApprovals from './pages/admin/ProductApprovals';
import Categories from './pages/admin/Categories';
import AllOrders from './pages/admin/AllOrders';
import Users from './pages/admin/Users';

function App() {
  return (
    <BrowserRouter>
    <AppEntry>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route element={<CustomerLayout />}>
                <Route path="/" element={<Storefront />} />
                <Route path="/products/:id" element={<ProductDetail />} />

                <Route path="/cart" element={<ProtectedRoute roles={['customer']}><Cart /></ProtectedRoute>} />
                <Route path="/wishlist" element={<ProtectedRoute roles={['customer']}><Wishlist /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute roles={['customer']}><Checkout /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute roles={['customer']}><MyOrders /></ProtectedRoute>} />
              </Route>

              <Route
                element={
                  <ProtectedRoute roles={['vendor']}>
                    <VendorLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/vendor" element={<VendorDashboard />} />
                <Route path="/vendor/products" element={<MyProducts />} />
                <Route path="/vendor/products/new" element={<AddProduct />} />
                <Route path="/vendor/orders" element={<VendorOrders />} />
                <Route path="/vendor/profile" element={<StoreProfile />} />
                <Route path="/vendor/products/edit/:id" element={<EditProduct />} />
              </Route>

              <Route
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/vendors" element={<VendorApprovals />} />
                <Route path="/admin/products" element={<ProductApprovals />} />
                <Route path="/admin/categories" element={<Categories />} />
                <Route path="/admin/orders" element={<AllOrders />} />
                <Route path="/admin/users" element={<Users />} />
              </Route>

              <Route
                path="/vendor-register"
                element={
                  <ProtectedRoute roles={['customer']}>
                    <VendorRegister />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={(() => { console.log('CATCH-ALL HIT, path:', window.location.pathname); return <Navigate to="/login" replace />; })()} />
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
      </AppEntry>
    </BrowserRouter>
  );
}

export default App;