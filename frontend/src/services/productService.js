import api from './api';

const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getTopProducts: (count = 5) => api.get(`/products/top/${count}`),
  getFeaturedProducts: () => api.get('/products/featured'),
  createProduct: (data) => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateProduct: (id, data) => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  addReview: (id, data) => api.post(`/reviews`, { ...data, product: id }),
  getReviews: (id, params) => api.get(`/reviews/product/${id}`, { params }),
  deleteImage: (productId, imageId) => api.delete(`/products/${productId}/images/${imageId}`),
};

export default productService;
