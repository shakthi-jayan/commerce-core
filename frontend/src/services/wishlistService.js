import api from './api';

const wishlistService = {
  getWishlist: () => api.get('/users/wishlist'),
  toggleWishlist: (productId) => api.put(`/users/wishlist/${productId}`),
};

export default wishlistService;
