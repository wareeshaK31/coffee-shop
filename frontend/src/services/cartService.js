import api from './authService';

export const cartService = {
  // Add item to cart
  async addToCart(menuItemId, quantity = 1, customizations = {}) {
    try {
      const response = await api.post('/api/cart/add', {
        menuItemId,
        quantity
        // Note: backend doesn't support customizations yet
      });
      return { cart: response.data }; // Backend returns cart directly
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add item to cart');
    }
  },

  // Get user cart
  async getCart() {
    try {
      const response = await api.get('/api/cart');
      return response.data; // Backend returns cart directly
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch cart');
    }
  },

  // Remove item from cart
  async removeFromCart(menuItemId) {
    try {
      const response = await api.delete(`/api/cart/remove/${menuItemId}`);
      return { cart: response.data }; // Backend returns cart directly
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove item from cart');
    }
  },

  // Update item quantity in cart
  async updateCartItem(menuItemId, quantity) {
    try {
      const response = await api.put('/api/cart/update', {
        menuItemId,
        quantity
      });
      return response.data; // Backend returns { message, cart }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update cart item');
    }
  },

  // Apply discount to cart
  async applyDiscount(discountCode) {
    try {
      const response = await api.post('/api/cart/apply-discount', {
        discountCode
      });
      return response.data; // Backend returns discount info and totals
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to apply discount');
    }
  },

  // Remove discount from cart
  async removeDiscount() {
    try {
      const response = await api.delete('/api/cart/discount');
      return response.data; // Backend returns { message, cart }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove discount');
    }
  },

  // Clear cart
  async clearCart() {
    try {
      const response = await api.delete('/api/cart/clear');
      return response.data; // Backend returns { message, cart }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to clear cart');
    }
  }
};
