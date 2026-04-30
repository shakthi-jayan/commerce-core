import { useSelector, useDispatch } from 'react-redux';
import { fetchCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../redux/slices/cartSlice';
import { useCallback } from 'react';

const useCart = () => {
  const dispatch = useDispatch();
  const { items, totalPrice, loading, error } = useSelector((s) => s.cart);

  const loadCart = useCallback(() => dispatch(fetchCart()), [dispatch]);
  const add = useCallback((productId, quantity = 1) => dispatch(addToCart({ productId, quantity })), [dispatch]);
  const updateQty = useCallback((productId, quantity) => dispatch(updateCartItem({ productId, quantity })), [dispatch]);
  const remove = useCallback((productId) => dispatch(removeCartItem(productId)), [dispatch]);
  const clear = useCallback(() => dispatch(clearCart()), [dispatch]);

  return { items, totalPrice, loading, error, itemCount: items.length, loadCart, add, updateQty, remove, clear };
};

export default useCart;
