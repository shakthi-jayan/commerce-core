import api from './api';

const orderService = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  getAllOrders: (params) => api.get('/orders', { params }),
  updateToPaid: (id, data) => api.put(`/orders/${id}/pay`, data),
  updateToDelivered: (id) => api.put(`/orders/${id}/deliver`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

export default orderService;
