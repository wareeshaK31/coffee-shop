import { useState, useEffect } from 'react';
import { discountService } from '../services/discountService';
import { Tag, Copy, Clock, Percent } from 'lucide-react';

const AvailableDiscounts = () => {
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
      // Backend returns array directly for available discounts
      setDiscounts(Array.isArray(data) ? data : data.discounts || []);
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

  const getDiscountIcon = (type) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-5 w-5" />;
      case 'fixed':
        return <Tag className="h-5 w-5" />;
      default:
        return <Tag className="h-5 w-5" />;
    }
  };

  const formatDiscountValue = (discount) => {
    if (discount.type === 'percentage') {
      return `${discount.value}% OFF`;
    } else if (discount.type === 'fixed') {
      return `$${discount.value} OFF`;
    }
    return 'DISCOUNT';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Discounts</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (discounts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-coffee-900 mb-2">Available Discounts</h3>
        <p className="text-gray-600">No active discounts available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-coffee-900 mb-4 flex items-center">
        <Tag className="h-5 w-5 mr-2" />
        Available Discounts
      </h3>
      
      <div className="space-y-4">
        {discounts.map((discount) => (
          <div 
            key={discount._id} 
            className="border border-green-200 rounded-lg p-4 bg-green-50 hover:bg-green-100 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <div className="bg-green-600 text-white p-2 rounded-lg mr-3">
                  {getDiscountIcon(discount.type)}
                </div>
                <div>
                  <h4 className="font-semibold text-coffee-900">{discount.name}</h4>
                  <p className="text-sm text-gray-600">{discount.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {formatDiscountValue(discount)}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                Valid until {new Date(discount.valid_to).toLocaleDateString()}
              </div>
              
              <button
                onClick={() => copyDiscountCode(discount.code)}
                className="flex items-center space-x-2 bg-coffee-800 hover:bg-coffee-900 text-white px-3 py-1 rounded-lg text-sm transition-colors"
              >
                <Copy className="h-4 w-4" />
                <span className="font-mono font-bold">{discount.code}</span>
              </button>
            </div>
            
            {discount.min_order_value > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                Minimum order: ${discount.min_order_value}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableDiscounts;
