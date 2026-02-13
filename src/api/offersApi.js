import apiClient from './apiClient';

export const offersApi = {
  // Get all offers (admin)
  getAllOffers: (params = {}) => {
    return apiClient.get('/offers/admin', { params });
  },

  // Get offer by ID
  getOfferById: (id) => {
    return apiClient.get(`/offers/${id}`);
  },

  // Create a new offer
  createOffer: (data) => {
    return apiClient.post('/offers', data);
  },

  // Update an offer
  updateOffer: (id, data) => {
    return apiClient.put(`/offers/${id}`, data);
  },

  // Delete an offer
  deleteOffer: (id) => {
    return apiClient.delete(`/offers/${id}`);
  },

  // Validate an offer code
  validateOffer: (data) => {
    return apiClient.post('/offers/validate', data);
  }
};

export default offersApi;