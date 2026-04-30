import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../../services/productService';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try { const { data } = await productService.getProducts(params); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch products'); }
});

export const fetchProduct = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try { const { data } = await productService.getProduct(id); return data.product; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch product'); }
});

export const fetchTopProducts = createAsyncThunk('products/fetchTop', async (count, { rejectWithValue }) => {
  try { const { data } = await productService.getTopProducts(count); return data.products; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch top products'); }
});

export const fetchFeaturedProducts = createAsyncThunk('products/fetchFeatured', async (_, { rejectWithValue }) => {
  try { const { data } = await productService.getFeaturedProducts(); return data.products; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch featured products'); }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [], product: null, topProducts: [], featuredProducts: [],
    loading: false, error: null,
    currentPage: 1, totalPages: 1, totalResults: 0,
  },
  reducers: { clearProductError: (s) => { s.error = null; }, clearProduct: (s) => { s.product = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchProducts.fulfilled, (s, a) => {
        s.loading = false; s.products = a.payload.products;
        s.currentPage = a.payload.currentPage; s.totalPages = a.payload.totalPages; s.totalResults = a.payload.totalResults;
      })
      .addCase(fetchProducts.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchProduct.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchProduct.fulfilled, (s, a) => { s.loading = false; s.product = a.payload; })
      .addCase(fetchProduct.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchTopProducts.fulfilled, (s, a) => { s.topProducts = a.payload; })
      .addCase(fetchFeaturedProducts.fulfilled, (s, a) => { s.featuredProducts = a.payload; });
  },
});

export const { clearProductError, clearProduct } = productSlice.actions;
export default productSlice.reducer;
