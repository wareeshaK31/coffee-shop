import api from './authService';

export const adminService = {
  // Menu Management
  async getAdminMenuItems() {
    try {
      const response = await api.get('/admin/menu');
      return { menuItems: response.data }; // Backend returns array directly
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch admin menu items');
    }
  },

  async createMenuItem(menuItemData) {
    try {
      const response = await api.post('/admin/menu', menuItemData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create menu item');
    }
  },

  async updateMenuItem(itemId, menuItemData) {
    try {
      const response = await api.put(`/admin/menu/${itemId}`, menuItemData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update menu item');
    }
  },

  async deleteMenuItem(itemId) {
    try {
      const response = await api.delete(`/admin/menu/${itemId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete menu item');
    }
  },

  // Order Management (if available)
  async getAllOrders() {
    try {
      const response = await api.get('/admin/orders');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  },

  async updateOrderStatus(orderId, status) {
    try {
      const response = await api.put(`/admin/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
  }
};
