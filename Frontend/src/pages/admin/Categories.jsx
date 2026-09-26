import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/categories');
      setCategories(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      const res = await axiosInstance.post('/categories', { name, description });
      setCategories([...categories, res.data.data]);
      setName('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await axiosInstance.delete(`/categories/${categoryId}`);
      setCategories(categories.filter((c) => c._id !== categoryId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="categories-page">
      <h1 className="cart-title">Manage Categories</h1>

      <form onSubmit={handleCreate} className="category-form">
        {error && <div className="auth-error">{error}</div>}

        <input
          type="text"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="auth-input"
          style={{ marginBottom: '10px' }}
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="auth-input"
          style={{ marginBottom: '10px' }}
        />
        <button type="submit" disabled={submitting} className="auth-button" style={{ width: 'auto', padding: '10px 20px' }}>
          {submitting ? 'Adding...' : '+ Add Category'}
        </button>
      </form>

      {loading ? (
        <p>Loading categories...</p>
      ) : categories.length === 0 ? (
        <p>No categories yet. Add one above.</p>
      ) : (
        <table className="products-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id}>
                <td>{cat.name}</td>
                <td>{cat.description || '—'}</td>
                <td>
                  <button onClick={() => handleDelete(cat._id)} className="table-delete-btn">
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

export default Categories;