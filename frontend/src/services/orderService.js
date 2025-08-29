import api from './authService';

export const orderService = {
  // Place order (backend creates order from cart automatically)
  async placeOrder() {
    try {
      const response = await api.post('/api/orders/place');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to place order');
    }
  },

  // Get user orders
  async getUserOrders() {
    try {
      const response = await api.get('/api/orders/my-orders');
      return { orders: response.data }; // Backend returns array directly
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  },

  // Get single order
  async getOrder(orderId) {
    try {
      const response = await api.get(`/api/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order');
    }
  },

  // Cancel order
  async cancelOrder(orderId) {
    try {
      const response = await api.put(`/api/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel order');
    }
  },

  // Update order status (admin)
  async updateOrderStatus(orderId, status) {
    try {
      const response = await api.put(`/api/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
  }
};
