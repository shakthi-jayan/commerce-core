import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminLayout from '../admin/layout/AdminLayout';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  
  return <AdminLayout>{children}</AdminLayout>;
};

export default AdminRoute;
