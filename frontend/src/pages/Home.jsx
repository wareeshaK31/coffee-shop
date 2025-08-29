import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { menuService } from '../services/menuService';
import { useAuth } from '../contexts/AuthContext';
// import AvailableDiscounts from '../components/AvailableDiscounts';
import { Coffee, Star, ArrowRight, Users, Award, Clock } from 'lucide-react';

const Home = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchFeaturedItems();
  }, []);

  const fetchFeaturedItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await menuService.getMenuItems();
      // Get first 3 items as featured
      setFeaturedItems((data.menuItems || []).slice(0, 3));
    } catch (err) {
      console.error('Failed to fetch featured items:', err);
      setError(err.message);
      setFeaturedItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="text-center max-w-4xl mx-auto px-4">
          <h1 className="hero-title">
            Christmas at Unicorn Coffee
          </h1>
          <p className="hero-subtitle">
            Experience the finest coffee blends crafted with passion and served with love
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/menu"
              className="btn-primary inline-flex items-center px-8 py-4 text-lg font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Browse Menu
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 text-lg font-medium border-2 border-white text-white rounded-lg hover:bg-white hover:text-gray-900 transition-all duration-200"
              >
                Join Us Today
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-20" style={{background: 'linear-gradient(135deg, #fefdfb 0%, #fdf8f6 100%)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="text-center mb-16">
                <h2 className="page-title">Best Sellers</h2>
                <p className="text-xl text-coffee-secondary">
                  Our most loved coffee creations
                </p>
              </div>

              {/* Best Sellers Grid */}
              {loading ? (
                <div className="flex justify-center">
                  <div className="loading-spinner h-12 w-12"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-600">
                  <p>{error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredItems.slice(0, 4).map((item) => (
                    <div key={item._id} className="card overflow-hidden hover:shadow-xl transition-shadow duration-300">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                        alt={item.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2 text-coffee-primary">{item.name}</h3>
                        <p className="text-gray-600 mb-4">{item.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-coffee-secondary">${item.price}</span>
                          <span className="text-sm text-gray-500 capitalize">{item.category}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Featured Menu Items */}
      <section className="page-container py-20">
        <div className="content-container">
          <div className="text-center mb-16">
            <h2 className="page-title">Featured Menu Items</h2>
            <p className="text-xl text-coffee-secondary">
              Try our signature coffee blends
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="loading-spinner h-12 w-12"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredItems.map((item, index) => (
                <div key={item._id} className="card overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-coffee-primary">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 mb-4">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-coffee-secondary">
                        ${item.price.toFixed(2)}
                      </span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/menu"
              className="btn-primary inline-flex items-center px-8 py-4 text-lg font-medium rounded-lg transition-colors duration-200"
            >
              View Full Menu
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="content-container">
          <div className="text-center mb-16">
            <h2 className="page-title">Why Choose Unicorn Coffee?</h2>
            <p className="text-xl text-coffee-secondary">
              We're committed to excellence in every cup
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-coffee-100">
                <Coffee className="h-8 w-8 text-coffee-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-coffee-primary">Premium Quality</h3>
              <p className="text-gray-600">Sourced from the finest coffee beans around the world</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-coffee-100">
                <Clock className="h-8 w-8 text-coffee-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-coffee-primary">Fast Service</h3>
              <p className="text-gray-600">Quick preparation without compromising on quality</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-coffee-100">
                <Users className="h-8 w-8 text-coffee-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-coffee-primary">Community</h3>
              <p className="text-gray-600">Join our coffee-loving community and earn rewards</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20 text-white text-center"
        style={{
          backgroundImage: `linear-gradient(rgba(67, 48, 43, 0.8), rgba(67, 48, 43, 0.8)), url('https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6 font-serif-primary">
            Ready to Start Your Coffee Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of coffee lovers who trust Unicorn Coffee for their daily brew
          </p>
          {!isAuthenticated ? (
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 text-lg font-medium bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          ) : (
            <Link
              to="/menu"
              className="inline-flex items-center px-8 py-4 text-lg font-medium bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Order Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
