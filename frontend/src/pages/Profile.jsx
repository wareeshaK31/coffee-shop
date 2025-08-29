import { useAuth } from '../contexts/AuthContext';
import AdminPromotion from '../components/AdminPromotion';
import { User, Mail, Shield } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #fefdfb 0%, #fdf8f6 100%)'}}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8" style={{fontFamily: 'Playfair Display, serif', color: '#43302b'}}>
          User Profile
        </h1>

        {/* User Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center mr-4">
              <User className="h-8 w-8" style={{color: '#846358'}} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold" style={{color: '#43302b'}}>{user?.name}</h2>
              <div className="flex items-center text-gray-600 mt-1">
                <Mail className="h-4 w-4 mr-2" />
                {user?.email}
              </div>
              {user?.is_staff && (
                <div className="flex items-center text-green-600 mt-1">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin User
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Admin Promotion */}
        <AdminPromotion />

        {/* Additional Profile Sections */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4" style={{color: '#43302b'}}>Account Settings</h3>
          <p className="text-gray-600">
            Profile management features coming soon! You'll be able to update your information,
            change password, and manage preferences.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
