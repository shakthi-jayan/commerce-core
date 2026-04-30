import { Link, useLocation } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { FiHome, FiBox, FiShoppingCart, FiUsers, FiSettings, FiFileText, FiTag, FiStar } from 'react-icons/fi';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: FiHome },
    { name: 'Products', path: '/admin/products', icon: FiBox },
    { name: 'Orders', path: '/admin/orders', icon: FiShoppingCart },
    { name: 'Users', path: '/admin/users', icon: FiUsers },
    { name: 'Categories', path: '/admin/categories', icon: FiTag },
    { name: 'Reviews', path: '/admin/reviews', icon: FiStar },
    { name: 'Reports', path: '/admin/reports', icon: FiFileText },
    { name: 'Settings', path: '/admin/settings', icon: FiSettings },
  ];

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <span className="brand-icon">🛡️</span>
        <span className="brand-text gradient-text">Admin Panel</span>
      </div>
      <Nav className="flex-column admin-nav">
        {menuItems.map((item) => (
          <Nav.Link
            key={item.name}
            as={Link}
            to={item.path}
            className={location.pathname.startsWith(item.path) ? 'active' : ''}
          >
            <item.icon className="nav-icon" />
            <span className="nav-text">{item.name}</span>
          </Nav.Link>
        ))}
      </Nav>
    </div>
  );
};

export default AdminSidebar;
