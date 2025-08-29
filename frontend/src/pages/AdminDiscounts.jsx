import { useState, useEffect } from 'react';
import { discountService } from '../services/discountService';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit, Trash2, Save, X, Tag, Percent, Calendar } from 'lucide-react';

const AdminDiscounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    type: 'percentage',
    value: '',
    min_order_value: '',
    valid_from: '',
    valid_to: '',
    is_active: true
  });

  const { user } = useAuth();

  useEffect(() => {
    if (user?.is_staff) {
      fetchDiscounts();
    }
  }, [user]);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const data = await discountService.getAllDiscounts();
      setDiscounts(data.discounts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const discountData = {
        ...formData,
        value: parseFloat(formData.value),
        min_order_value: parseFloat(formData.min_order_value) || 0
      };

      if (editingDiscount) {
        await discountService.updateDiscount(editingDiscount._id, discountData);
        alert('Discount updated successfully!');
      } else {
        await discountService.createDiscount(discountData);
        alert('Discount created successfully!');
      }

      resetForm();
      fetchDiscounts();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEdit = (discount) => {
    setEditingDiscount(discount);
    setFormData({
      name: discount.name,
      description: discount.description,
      code: discount.code,
      type: discount.type,
      value: discount.value.toString(),
      min_order_value: discount.min_order_value?.toString() || '',
      valid_from: discount.valid_from ? new Date(discount.valid_from).toISOString().split('T')[0] : '',
      valid_to: discount.valid_to ? new Date(discount.valid_to).toISOString().split('T')[0] : '',
      is_active: discount.is_active
    });
    setShowAddForm(true);
  };

  const handleDelete = async (discountId) => {
    if (!confirm('Are you sure you want to delete this discount?')) return;
    
    try {
      await discountService.deleteDiscount(discountId);
      alert('Discount deleted successfully!');
      fetchDiscounts();
    } catch (err) {
      alert('Error deleting discount: ' + err.message);
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingDiscount(null);
    setFormData({
      name: '',
      description: '',
      code: '',
      type: 'percentage',
      value: '',
      min_order_value: '',
      valid_from: '',
      valid_to: '',
      is_active: true
    });
  };

  const generateDiscountCode = () => {
    const code = 'SAVE' + Math.random().toString(36).substr(2, 6).toUpperCase();
    setFormData(prev => ({ ...prev, code }));
  };

  if (!user?.is_staff) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600">You need admin privileges to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="flex items-center justify-center">
            <div className="loading-spinner h-32 w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="flex justify-between items-center mb-8">
          <h1 className="page-title">Discount Management</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Discount</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="card mb-8">
            <div className="card-header">
              <div className="flex justify-between items-center">
                <h2 className="section-title">
                  {editingDiscount ? 'Edit Discount' : 'Add New Discount'}
                </h2>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="card-body">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="e.g., Summer Sale"
                  />
                </div>

                <div>
                  <label className="form-label">Discount Code *</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="e.g., SAVE20"
                    />
                    <button
                      type="button"
                      onClick={generateDiscountCode}
                      className="btn-secondary"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div>
                  <label className="form-label">Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">
                    Value * {formData.type === 'percentage' ? '(%)' : '($)'}
                  </label>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    max={formData.type === 'percentage' ? '100' : undefined}
                    required
                    className="form-input"
                    placeholder={formData.type === 'percentage' ? '20' : '5.00'}
                  />
                </div>

                <div>
                  <label className="form-label">Minimum Order Amount ($)</label>
                  <input
                    type="number"
                    name="min_order_value"
                    value={formData.min_order_value}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="form-input"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="form-label">Valid From *</label>
                  <input
                    type="date"
                    name="valid_from"
                    value={formData.valid_from}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Valid Until *</label>
                  <input
                    type="date"
                    name="valid_to"
                    value={formData.valid_to}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="form-input"
                    placeholder="Describe the discount offer..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="form-label mb-0">Active</span>
                  </label>
                </div>

                <div className="md:col-span-2 flex space-x-4">
                  <button type="submit" className="btn-primary flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>{editingDiscount ? 'Update' : 'Create'}</span>
                  </button>
                  <button type="button" onClick={resetForm} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Discounts List */}
        <div className="card">
          <div className="card-header">
            <h2 className="section-title">All Discounts</h2>
          </div>
          
          {discounts.length === 0 ? (
            <div className="card-body text-center text-gray-500">
              No discounts found. Create your first discount!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead className="bg-gray-50">
                  <tr>
                    <th>Discount</th>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Min Order</th>
                    <th>Valid Until</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {discounts.map((discount) => (
                    <tr key={discount._id}>
                      <td>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{discount.name}</div>
                          <div className="text-sm text-gray-500">{discount.description}</div>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                          {discount.code}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center">
                          {discount.type === 'percentage' ? (
                            <Percent className="h-4 w-4 mr-1" />
                          ) : (
                            <Tag className="h-4 w-4 mr-1" />
                          )}
                          {discount.type}
                        </div>
                      </td>
                      <td>
                        {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                      </td>
                      <td>${discount.min_order_value || 0}</td>
                      <td>
                        {discount.valid_to ? (
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(discount.valid_to).toLocaleDateString()}
                          </div>
                        ) : (
                          'No expiry'
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${discount.is_active ? 'status-available' : 'status-unavailable'}`}>
                          {discount.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(discount)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(discount._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDiscounts;
