import { useState, useEffect } from 'react';
import { discountService } from '../services/discountService';
import { Tag, Calendar, Percent } from 'lucide-react';

const Discounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActiveDiscounts();
  }, []);

  const fetchActiveDiscounts = async () => {
    try {
      setLoading(true);
      const data = await discountService.getActiveDiscounts();
      setDiscounts(data.discounts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyDiscountCode = (code) => {
    navigator.clipboard.writeText(code);
    alert('Discount code copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coffee-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Discounts</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #fefdfb 0%, #fdf8f6 100%)'}}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8" style={{fontFamily: 'Playfair Display, serif', color: '#43302b'}}>
          Available Discounts
        </h1>

        {discounts.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="h-24 w-24 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4" style={{color: '#43302b'}}>No Active Discounts</h2>
            <p className="text-gray-600">Check back later for amazing deals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {discounts.map((discount) => (
              <div key={discount._id} className="bg-white rounded-xl shadow-lg p-6 border-l-4" style={{borderLeftColor: '#846358'}}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2" style={{color: '#43302b'}}>
                      {discount.name}
                    </h3>
                    <p className="text-gray-600 mb-3">{discount.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-green-600 font-bold text-lg">
                      <Percent className="h-5 w-5 mr-1" />
                      {discount.type === 'percentage' ? `${discount.value}% OFF` : `$${discount.value} OFF`}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Discount Code:</span>
                    <button
                      onClick={() => copyDiscountCode(discount.code)}
                      className="font-mono font-bold text-lg px-3 py-1 bg-coffee-800 text-white rounded hover:bg-coffee-900 transition-colors"
                      style={{backgroundColor: '#846358'}}
                    >
                      {discount.code}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Valid until: {new Date(discount.valid_to).toLocaleDateString()}
                  </div>
                  {discount.max_uses && (
                    <div>
                      Used: {discount.current_uses || 0}/{discount.max_uses}
                    </div>
                  )}
                </div>

                {discount.min_order_value > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    Minimum order: ${discount.min_order_value}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discounts;
