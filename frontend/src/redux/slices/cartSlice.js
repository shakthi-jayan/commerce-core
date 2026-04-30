import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartService from '../../services/cartService';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try { const { data } = await cartService.getCart(); return data.cart; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch cart'); }
});

export const addToCart = createAsyncThunk('cart/add', async ({ productId, quantity }, { rejectWithValue }) => {
  try { const { data } = await cartService.addToCart(productId, quantity); return data.cart; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to add to cart'); }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ productId, quantity }, { rejectWithValue }) => {
  try { const { data } = await cartService.updateQuantity(productId, quantity); return data.cart; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to update cart'); }
});

export const removeCartItem = createAsyncThunk('cart/remove', async (productId, { rejectWithValue }) => {
  try { const { data } = await cartService.removeItem(productId); return data.cart; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to remove item'); }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try { await cartService.clearCart(); return { items: [], totalPrice: 0 }; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to clear cart'); }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], totalPrice: 0, loading: false, error: null },
  reducers: { clearCartError: (s) => { s.error = null; } },
  extraReducers: (builder) => {
    const setCart = (s, a) => { s.loading = false; s.items = a.payload.items || []; s.totalPrice = a.payload.totalPrice || 0; };
    builder
      .addCase(fetchCart.pending, (s) => { s.loading = true; })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(fetchCart.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(addToCart.pending, (s) => { s.loading = true; })
      .addCase(addToCart.fulfilled, setCart)
      .addCase(addToCart.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(removeCartItem.fulfilled, setCart)
      .addCase(clearCart.fulfilled, setCart);
  },
});

export const { clearCartError } = cartSlice.actions;
export default cartSlice.reducer;
