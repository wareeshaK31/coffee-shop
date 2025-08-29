import api from './authService';

export const menuService = {
  // Get all menu items (public)
  async getMenuItems() {
    try {
      const response = await api.get('/menu');
      return { menuItems: response.data }; // Backend returns array directly
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch menu items');
    }
  },

  // Get menu items by category
  async getMenuItemsByCategory(category) {
    try {
      const response = await api.get(`/menu/category/${category}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch menu items by category');
    }
  },

  // Get single menu item
  async getMenuItem(id) {
    try {
      const response = await api.get(`/menu/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch menu item');
    }
  },

  // Search menu items
  async searchMenuItems(query) {
    try {
      const response = await api.get(`/menu/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search menu items');
    }
  }
};
