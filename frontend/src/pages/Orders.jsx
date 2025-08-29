import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { Package, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getUserOrders();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'preparing':
        return <Package className="h-5 w-5 text-orange-500" />;
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Orders</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchOrders}
            className="bg-coffee-800 hover:bg-coffee-900 text-white font-medium py-2 px-4 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #fefdfb 0%, #fdf8f6 100%)'}}>
        <div className="text-center">
          <Package className="h-24 w-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4" style={{color: '#43302b'}}>No Orders Yet</h2>
          <p className="text-gray-600 mb-8">You haven't placed any orders yet. Start by browsing our menu!</p>
          <button
            onClick={() => window.location.href = '/menu'}
            className="bg-coffee-800 hover:bg-coffee-900 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            style={{backgroundColor: '#846358'}}
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #fefdfb 0%, #fdf8f6 100%)'}}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8" style={{fontFamily: 'Playfair Display, serif', color: '#43302b'}}>
          My Orders
        </h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-lg p-6">
              {/* Order Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold" style={{color: '#43302b'}}>
                    Order #{order._id.slice(-8)}
                  </h3>
                  <div className="flex items-center text-gray-600 text-sm mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(order.order_date || order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-2 capitalize">{order.status}</span>
                  </div>
                  <div className="text-lg font-bold mt-2" style={{color: '#846358'}}>
                    ${(order.total_after_discount || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3" style={{color: '#43302b'}}>Items:</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="font-medium">{item.menuItem?.name || 'Unknown Item'}</span>
                        <span className="text-gray-600 ml-2">x{item.quantity}</span>
                      </div>
                      <span className="font-medium" style={{color: '#846358'}}>
                        ${((item.price || item.menuItem?.price || 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Discount Info */}
                {order.discount && order.discount_amount > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between items-center text-green-600">
                      <span>Discount Applied:</span>
                      <span>-${order.discount_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                )}

                {/* Order Actions */}
                {order.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t">
                    <button
                      onClick={async () => {
                        try {
                          await orderService.cancelOrder(order._id);
                          fetchOrders();
                          alert('Order cancelled successfully');
                        } catch (err) {
                          alert('Failed to cancel order: ' + err.message);
                        }
                      }}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
