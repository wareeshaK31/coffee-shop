import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { orderService } from '../services/orderService';
import AvailableDiscounts from '../components/AvailableDiscounts';
import { Minus, Plus, Trash2, ShoppingBag, Tag } from 'lucide-react';

const Cart = () => {
  const [discountCode, setDiscountCode] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const navigate = useNavigate();

  const {
    cart,
    loading,
    error,
    updateCartItem,
    removeFromCart,
    applyDiscount,
    removeDiscount,
    clearCart,
    fetchCart
  } = useCart();

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (err) {
      alert('Failed to update quantity: ' + err.message);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
    } catch (err) {
      alert('Failed to remove item: ' + err.message);
    }
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;

    // Check if cart is empty
    if (!cart.items || cart.items.length === 0) {
      alert('Please add items to your cart before applying a discount.');
      return;
    }

    try {
      await applyDiscount(discountCode);
      setDiscountCode('');
      alert('Discount applied successfully!');
    } catch (err) {
      alert('Failed to apply discount: ' + err.message);
    }
  };

  const handleRemoveDiscount = async () => {
    try {
      await removeDiscount();
      alert('Discount removed');
    } catch (err) {
      alert('Failed to remove discount: ' + err.message);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setIsPlacingOrder(true);
      // Backend creates order from cart automatically
      const response = await orderService.placeOrder();
      // Cart is cleared automatically by backend
      await fetchCart(); // Refresh cart to show it's empty
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      alert('Failed to place order: ' + err.message);
    } finally {
      setIsPlacingOrder(false);
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
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Cart</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="text-center">
            <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-coffee-primary">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8">Add some delicious items from our menu!</p>
            <button
              onClick={() => navigate('/menu')}
              className="btn-primary py-3 px-6"
            >
              Browse Menu
            </button>
          </div>

          {/* Show available discounts even when cart is empty */}
          <div className="mt-12 max-w-md mx-auto">
            <AvailableDiscounts />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container max-w-6xl">
        <h1 className="page-title">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-3">
            <div className="card">
              <div className="p-6">
                {cart.items.map((item) => (
                <div key={item.menuItem._id} className="flex items-center py-4 border-b border-gray-200 last:border-b-0">
                  {item.menuItem.image && (
                    <img
                      src={item.menuItem.image}
                      alt={item.menuItem.name}
                      className="w-16 h-16 object-cover rounded-lg mr-4"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-coffee-primary">{item.menuItem.name}</h3>
                    <p className="text-gray-600 text-sm">${item.menuItem.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuantityChange(item.menuItem._id, item.quantity - 1)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-medium w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.menuItem._id, item.quantity + 1)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.menuItem._id)}
                      className="p-1 rounded-full hover:bg-red-100 text-red-600 ml-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="ml-4 font-semibold text-coffee-secondary">
                    ${(item.menuItem.price * item.quantity).toFixed(2)}
                  </div>
                </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary and Discounts */}
          <div className="lg:col-span-1 space-y-6">
            {/* Available Discounts */}
            <AvailableDiscounts />

            {/* Order Summary */}
            <div className="card sticky top-4">
              <div className="p-6">
              <h2 className="section-title">Order Summary</h2>

              {/* Discount Code */}
              <div className="mb-4">
                <label className="form-label">
                  Discount Code
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder={cart.items?.length === 0 ? "Add items first" : "Enter code"}
                    disabled={cart.items?.length === 0}
                    className={`form-input flex-1 ${cart.items?.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <button
                    onClick={handleApplyDiscount}
                    disabled={cart.items?.length === 0}
                    className={`btn-primary px-4 py-2 ${cart.items?.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Apply
                  </button>
                </div>
                {cart.appliedDiscount && (
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-green-600 flex items-center">
                      <Tag className="h-4 w-4 mr-1" />
                      Discount Applied
                    </span>
                    <button
                      onClick={handleRemoveDiscount}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${(cart.totalBeforeDiscount || 0).toFixed(2)}</span>
                </div>
                {cart.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-${cart.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg text-coffee-primary">
                    <span>Total:</span>
                    <span>${(cart.totalAfterDiscount || cart.totalBeforeDiscount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full btn-primary py-3 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
