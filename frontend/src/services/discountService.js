import api from './authService';

export const discountService = {
  // Get all discounts (admin)
  async getAllDiscounts() {
    try {
      const response = await api.get('/api/discounts');
      return { discounts: response.data }; // Backend returns array directly
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch discounts');
    }
  },

  // Get active discounts (public)
  async getActiveDiscounts() {
    try {
      const response = await api.get('/api/discounts/available');
      return { discounts: response.data }; // Backend returns array directly
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch active discounts');
    }
  },

  // Validate discount code
  async validateDiscount(code) {
    try {
      const response = await api.post('/api/discounts/validate', { code });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Invalid discount code');
    }
  },

  // Create discount (admin)
  async createDiscount(discountData) {
    try {
      const response = await api.post('/api/discounts', discountData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create discount');
    }
  },

  // Update discount (admin)
  async updateDiscount(discountId, discountData) {
    try {
      const response = await api.put(`/api/discounts/${discountId}`, discountData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update discount');
    }
  },

  // Delete discount (admin)
  async deleteDiscount(discountId) {
    try {
      const response = await api.delete(`/api/discounts/${discountId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete discount');
    }
  }
};
