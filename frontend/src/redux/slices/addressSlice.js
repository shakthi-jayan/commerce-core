import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import addressService from '../../services/addressService';

export const fetchAddresses = createAsyncThunk('address/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await addressService.getAddresses();
    return data.addresses;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch addresses');
  }
});

export const addAddress = createAsyncThunk('address/add', async (addressData, { rejectWithValue }) => {
  try {
    const { data } = await addressService.addAddress(addressData);
    return data.addresses;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add address');
  }
});

export const updateAddress = createAsyncThunk('address/update', async ({ id, addressData }, { rejectWithValue }) => {
  try {
    const { data } = await addressService.updateAddress(id, addressData);
    return data.addresses;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update address');
  }
});

export const deleteAddress = createAsyncThunk('address/delete', async (id, { rejectWithValue }) => {
  try {
    const { data } = await addressService.deleteAddress(id);
    return data.addresses;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete address');
  }
});

export const setDefaultAddress = createAsyncThunk('address/setDefault', async (id, { rejectWithValue }) => {
  try {
    const { data } = await addressService.setDefaultAddress(id);
    return data.addresses;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to set default address');
  }
});

const addressSlice = createSlice({
  name: 'address',
  initialState: {
    addresses: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearAddressError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchAddresses.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchAddresses.fulfilled, (s, a) => { s.loading = false; s.addresses = a.payload; })
      .addCase(fetchAddresses.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      // Add
      .addCase(addAddress.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(addAddress.fulfilled, (s, a) => { s.loading = false; s.addresses = a.payload; })
      .addCase(addAddress.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      // Update
      .addCase(updateAddress.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(updateAddress.fulfilled, (s, a) => { s.loading = false; s.addresses = a.payload; })
      .addCase(updateAddress.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      // Delete
      .addCase(deleteAddress.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(deleteAddress.fulfilled, (s, a) => { s.loading = false; s.addresses = a.payload; })
      .addCase(deleteAddress.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      // Set Default
      .addCase(setDefaultAddress.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(setDefaultAddress.fulfilled, (s, a) => { s.loading = false; s.addresses = a.payload; })
      .addCase(setDefaultAddress.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { clearAddressError } = addressSlice.actions;
export default addressSlice.reducer;
