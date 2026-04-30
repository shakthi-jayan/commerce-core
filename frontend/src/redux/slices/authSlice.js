import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

const user = JSON.parse(localStorage.getItem('user'));

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try { const { data } = await authService.register(userData); localStorage.setItem('accessToken', data.accessToken); localStorage.setItem('refreshToken', data.refreshToken); localStorage.setItem('user', JSON.stringify(data.user)); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Registration failed'); }
});

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try { const { data } = await authService.login(credentials); localStorage.setItem('accessToken', data.accessToken); localStorage.setItem('refreshToken', data.refreshToken); localStorage.setItem('user', JSON.stringify(data.user)); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Login failed'); }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await authService.logout(); localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); localStorage.removeItem('user');
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try { const { data } = await authService.getMe(); localStorage.setItem('user', JSON.stringify(data.user)); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to get user'); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: user || null, isAuthenticated: !!user, loading: false, error: null },
  reducers: {
    clearError: (state) => { state.error = null; },
    setUser: (state, action) => { state.user = action.payload; state.isAuthenticated = !!action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(registerUser.fulfilled, (s, a) => { s.loading = false; s.isAuthenticated = true; s.user = a.payload.user; })
      .addCase(registerUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(loginUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(loginUser.fulfilled, (s, a) => { s.loading = false; s.isAuthenticated = true; s.user = a.payload.user; })
      .addCase(loginUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(logoutUser.fulfilled, (s) => { s.user = null; s.isAuthenticated = false; s.loading = false; })
      .addCase(getMe.fulfilled, (s, a) => { s.user = a.payload.user; s.isAuthenticated = true; })
      .addCase(getMe.rejected, (s) => { s.user = null; s.isAuthenticated = false; });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
