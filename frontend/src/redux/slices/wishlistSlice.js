import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import wishlistService from '../../services/wishlistService';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await wishlistService.getWishlist();
    return data.wishlist;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch wishlist');
  }
});

export const toggleWishlistItem = createAsyncThunk('wishlist/toggle', async (productId, { rejectWithValue }) => {
  try {
    const { data } = await wishlistService.toggleWishlist(productId);
    return { wishlist: data.wishlist, action: data.action };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update wishlist');
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],       // Array of product IDs (from toggle endpoint)
    products: [],    // Populated product objects (from fetch endpoint)
    loading: false,
    error: null,
  },
  reducers: {
    clearWishlist: (state) => { state.items = []; state.products = []; },
    clearWishlistError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchWishlist.fulfilled, (s, a) => {
        s.loading = false;
        s.products = a.payload;
        s.items = a.payload.map(p => p._id);
      })
      .addCase(fetchWishlist.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(toggleWishlistItem.pending, (s) => { s.error = null; })
      .addCase(toggleWishlistItem.fulfilled, (s, a) => {
        s.items = a.payload.wishlist;
      })
      .addCase(toggleWishlistItem.rejected, (s, a) => { s.error = a.payload; });
  },
});

export const { clearWishlist, clearWishlistError } = wishlistSlice.actions;
export default wishlistSlice.reducer;
