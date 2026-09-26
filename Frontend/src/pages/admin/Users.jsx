import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = roleFilter ? { role: roleFilter } : {};
      const res = await axiosInstance.get('/admin/users', { params });
      setUsers(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await axiosInstance.put(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      setUsers(users.map((u) => (u._id === userId ? { ...u, isActive: !currentStatus } : u)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="storefront-error">{error}</p>;

  return (
    <div className="users-page">
      <h1 className="cart-title">Manage Users</h1>

      <select
        value={roleFilter}
        onChange={(e) => setRoleFilter(e.target.value)}
        className="auth-select"
        style={{ width: 'auto', marginBottom: '20px' }}
      >
        <option value="">All Roles</option>
        <option value="customer">Customers</option>
        <option value="vendor">Vendors</option>
        <option value="admin">Admins</option>
      </select>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="products-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: user.isActive ? '#5cb85c' : '#d9534f' }}
                  >
                    {user.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td>
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => handleToggleStatus(user._id, user.isActive)}
                      className={user.isActive ? 'table-delete-btn' : 'approve-btn'}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Users;