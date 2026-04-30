import { Navbar, Dropdown, Container, Button } from 'react-bootstrap';
import { FiMenu, FiBell, FiUser, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../../context/ThemeContext';
import useAuth from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './AdminHeader.css';

const AdminHeader = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <Navbar className="admin-header px-4" expand="lg">
      <div className="d-flex w-100 justify-content-between align-items-center">
        <Button variant="link" className="sidebar-toggle d-lg-none" onClick={toggleSidebar}>
          <FiMenu size={24} />
        </Button>
        
        <div className="ms-auto d-flex align-items-center gap-3">
          <Button variant="link" className="header-icon-btn" onClick={toggleTheme}>
            {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
          </Button>

          <Dropdown align="end">
            <Dropdown.Toggle variant="link" className="header-icon-btn position-relative">
              <FiBell size={20} />
              <span className="notification-badge">3</span>
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-custom">
              <Dropdown.Header>Notifications</Dropdown.Header>
              <Dropdown.Item>New Order #10023</Dropdown.Item>
              <Dropdown.Item>Low stock warning: Product XYZ</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown align="end">
            <Dropdown.Toggle variant="link" className="user-profile-btn d-flex align-items-center gap-2">
              <div className="nav-avatar">{user?.name?.[0]?.toUpperCase() || 'A'}</div>
              <span className="d-none d-sm-inline">{user?.name}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-custom">
              <Dropdown.Item onClick={() => navigate('/')}>Back to Store</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="text-danger">
                <FiLogOut className="me-2" /> Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </Navbar>
  );
};

export default AdminHeader;
