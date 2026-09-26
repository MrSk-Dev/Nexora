import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const statusColors = {
  pending: '#f0ad4e',
  approved: '#5cb85c',
  rejected: '#d9534f',
};

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/products/vendor/mine');
      setProducts(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axiosInstance.delete(`/products/${productId}`);
      setProducts(products.filter((p) => p._id !== productId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  if (loading) return <p>Loading your products...</p>;
  if (error) return <p className="storefront-error">{error}</p>;

  return (
    <div className="my-products-page">
      <div className="page-header-row">
        <h1 className="cart-title">My Products</h1>
        <Link to="/vendor/products/new" className="auth-button" style={{ display: 'inline-block', width: 'auto', padding: '10px 20px', textDecoration: 'none' }}>
          + Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p>You haven't listed any products yet.</p>
      ) : (
        <table className="products-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>
                  <img
                    src={product.images?.[0] ? `http://localhost:5000${product.images[0]}` : 'https://via.placeholder.com/50'}
                    alt={product.name}
                    className="table-thumbnail"
                  />
                </td>
                <td>{product.name}</td>
                <td>₹{product.discountPrice || product.price}</td>
                <td>{product.stock}</td>
                <td>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: statusColors[product.approvalStatus] }}
                  >
                    {product.approvalStatus}
                  </span>
                  {product.approvalStatus === 'rejected' && product.rejectionReason && (
                    <p className="rejection-reason">{product.rejectionReason}</p>
                  )}
                </td>
                <td>
                  <button onClick={() => navigate(`/vendor/products/edit/${product._id}`)} className="approve-btn" style={{ marginRight: '6px' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(product._id)} className="table-delete-btn">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyProducts;