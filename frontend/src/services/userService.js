import api from './api';

const userService = {
  updateProfile: (data) => api.put('/users/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data) => api.post('/users/addresses', data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  setDefaultAddress: (id) => api.put(`/users/addresses/${id}/default`),
  toggleWishlist: (productId) => api.put(`/users/wishlist/${productId}`),
  getWishlist: () => api.get('/users/wishlist'),
  // Admin
  getAllUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  deleteUser: (id) => api.delete(`/users/${id}`),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
};

export default userService;
