import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../../services/orderService';

export const createOrder = createAsyncThunk('orders/create', async (orderData, { rejectWithValue }) => {
  try { const { data } = await orderService.createOrder(orderData); return data.order; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to create order'); }
});

export const fetchMyOrders = createAsyncThunk('orders/fetchMy', async (params, { rejectWithValue }) => {
  try { const { data } = await orderService.getMyOrders(params); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders'); }
});

export const fetchOrder = createAsyncThunk('orders/fetchOne', async (id, { rejectWithValue }) => {
  try { const { data } = await orderService.getOrder(id); return data.order; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch order'); }
});

export const fetchAllOrders = createAsyncThunk('orders/fetchAll', async (params, { rejectWithValue }) => {
  try { const { data } = await orderService.getAllOrders(params); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders'); }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: { orders: [], order: null, loading: false, error: null, currentPage: 1, totalPages: 1, totalOrders: 0, totalRevenue: 0 },
  reducers: { clearOrderError: (s) => { s.error = null; }, clearOrder: (s) => { s.order = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createOrder.fulfilled, (s, a) => { s.loading = false; s.order = a.payload; })
      .addCase(createOrder.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchMyOrders.pending, (s) => { s.loading = true; })
      .addCase(fetchMyOrders.fulfilled, (s, a) => { s.loading = false; s.orders = a.payload.orders; s.currentPage = a.payload.currentPage; s.totalPages = a.payload.totalPages; s.totalOrders = a.payload.totalOrders; })
      .addCase(fetchMyOrders.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchOrder.pending, (s) => { s.loading = true; })
      .addCase(fetchOrder.fulfilled, (s, a) => { s.loading = false; s.order = a.payload; })
      .addCase(fetchOrder.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchAllOrders.fulfilled, (s, a) => { s.loading = false; s.orders = a.payload.orders; s.totalOrders = a.payload.totalOrders; s.totalRevenue = a.payload.totalRevenue; s.currentPage = a.payload.currentPage; s.totalPages = a.payload.totalPages; });
  },
});

export const { clearOrderError, clearOrder } = orderSlice.actions;
export default orderSlice.reducer;
