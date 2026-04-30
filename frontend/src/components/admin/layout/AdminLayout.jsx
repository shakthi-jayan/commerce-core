import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-layout">
      {sidebarOpen && (
        <div className="sidebar-overlay d-lg-none" onClick={() => setSidebarOpen(false)}></div>
      )}

      <div className={`admin-sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
        <AdminSidebar />
      </div>

      <div className="admin-main-content">
        <AdminHeader toggleSidebar={toggleSidebar} />
        <div className="admin-page-content p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
