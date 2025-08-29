import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Key } from 'lucide-react';

const AdminPromotion = () => {
  const [secretCode, setSecretCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { user, promoteToAdmin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!secretCode.trim()) return;

    try {
      setLoading(true);
      await promoteToAdmin(secretCode);
      alert('Successfully promoted to admin! Please refresh the page.');
      setSecretCode('');
      setShowForm(false);
    } catch (err) {
      alert('Failed to promote to admin: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (user?.is_staff) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-800 font-medium">You have admin privileges</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      {!showForm ? (
        <div className="text-center">
          <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-blue-900 mb-2">Become an Admin</h3>
          <p className="text-blue-700 mb-4">
            Have an admin secret code? Promote your account to access the admin dashboard.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Enter Admin Code
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center mb-4">
            <Key className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-blue-900">Enter Admin Secret Code</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Secret Code
            </label>
            <input
              type="password"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              placeholder="Enter the admin secret code"
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
            <p className="text-xs text-blue-600 mt-1">
              Hint: The secret code is "UNICORN_ADMIN_2024" (for demo purposes)
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Promoting...' : 'Promote to Admin'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setSecretCode('');
              }}
              className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminPromotion;
