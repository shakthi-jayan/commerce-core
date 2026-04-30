import api from './api';

/**
 * Admin API service — uses the shared `api` instance so the
 * auth-interceptor (Bearer token, refresh-token rotation, etc.)
 * is automatically applied to every request.
 *
 * NOTE: Do NOT set `Content-Type` manually for FormData requests.
 * The api interceptor auto-detects FormData and lets axios set
 * the correct `multipart/form-data` boundary.
 */
const adminService = {
  
  login: (credentials) => api.post('/admin/login', credentials),

  
  getDashboardStats: () => api.get('/admin/dashboard/stats'),

  
  getProducts: (params) => api.get('/admin/products', { params }),

  getProduct: (id) => api.get(`/admin/products/${id}`),

  createProduct: (formData) => api.post('/admin/products', formData),

  updateProduct: (id, formData) => api.put(`/admin/products/${id}`, formData),

  deleteProduct: (id) => api.delete(`/admin/products/${id}`),

  deleteProductImage: (productId, imageId) =>
    api.delete(`/admin/products/${productId}/images/${imageId}`),

  updateStock: (id, stock) =>
    api.put(`/admin/products/${id}/stock`, { stock }),

  bulkDeleteProducts: (productIds) =>
    api.post('/admin/products/bulk-delete', { productIds }),

  bulkUpdateStock: (updates) =>
    api.post('/admin/products/bulk-stock', { updates }),

  
  getOrders: (params) => api.get('/admin/orders', { params }),

  updateOrderStatus: (id, data) =>
    api.put(`/admin/orders/${id}/status`, data),

  cancelOrder: (id) => api.put(`/admin/orders/${id}/cancel`),

  
  getUsers: (params) => api.get('/admin/users', { params }),

  updateUserRole: (id, role) =>
    api.put(`/admin/users/${id}/role`, { role }),

  updateUserStatus: (id, isActive) =>
    api.put(`/admin/users/${id}/status`, { isActive }),

  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  
  getCategories: () => api.get('/categories/all'),

  createCategory: (formData) => api.post('/categories', formData),

  updateCategory: (id, formData) => api.put(`/categories/${id}`, formData),

  deleteCategory: (id) => api.delete(`/categories/${id}`),

  
  getReviews: (params) => api.get('/admin/reviews', { params }),

  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),

  
  exportProducts: () =>
    api.get('/admin/export/products', { responseType: 'blob' }),

  exportOrders: () =>
    api.get('/admin/export/orders', { responseType: 'blob' }),

  exportUsers: () =>
    api.get('/admin/export/users', { responseType: 'blob' }),

  
  generateInvoice: (id) =>
    api.get(`/admin/orders/${id}/invoice`, { responseType: 'blob' }),
};

export default adminService;
