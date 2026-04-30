import { useSelector, useDispatch } from 'react-redux';
import { loginUser, registerUser, logoutUser, getMe, clearError } from '../redux/slices/authSlice';
import { useCallback } from 'react';

const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((s) => s.auth);

  const login = useCallback((creds) => dispatch(loginUser(creds)), [dispatch]);
  const register = useCallback((data) => dispatch(registerUser(data)), [dispatch]);
  const logout = useCallback(() => dispatch(logoutUser()), [dispatch]);
  const fetchMe = useCallback(() => dispatch(getMe()), [dispatch]);
  const clearAuthError = useCallback(() => dispatch(clearError()), [dispatch]);

  return { user, isAuthenticated, loading, error, login, register, logout, fetchMe, clearAuthError, isAdmin: user?.role === 'admin' };
};

export default useAuth;
