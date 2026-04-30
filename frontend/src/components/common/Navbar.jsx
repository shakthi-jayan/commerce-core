import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, Container, Badge, Dropdown } from 'react-bootstrap';
import { FiShoppingCart, FiUser, FiSun, FiMoon, FiSearch, FiHeart, FiLogOut, FiSettings, FiPackage, FiMenu } from 'react-icons/fi';
import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import { useTheme } from '../../context/ThemeContext';
import SearchBar from './SearchBar';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <BSNavbar fixed="top" expand="lg" className="navbar-custom" data-theme={theme}>
      <Container style={{ maxWidth: 'var(--max-width)' }}>
        <Link to="/" className="navbar-brand-custom">
          <span className="brand-icon">🛒</span>
          <span className="brand-text gradient-text">CodeCommerce</span>
        </Link>

        <div className="d-flex align-items-center gap-2 d-lg-none">
          <button className="nav-icon-btn" onClick={() => setShowSearch(!showSearch)}>
            <FiSearch size={20} />
          </button>
          <Link to="/cart" className="nav-icon-btn position-relative">
            <FiShoppingCart size={20} />
            {itemCount > 0 && <Badge bg="danger" pill className="cart-badge">{itemCount}</Badge>}
          </Link>
          <BSNavbar.Toggle aria-controls="main-nav">
            <FiMenu size={20} />
          </BSNavbar.Toggle>
        </div>

        <BSNavbar.Collapse id="main-nav">
          <div className="nav-search-wrapper mx-auto d-none d-lg-block">
            <SearchBar />
          </div>

          <Nav className="ms-auto align-items-lg-center gap-lg-2">
            <Link to="/shop" className="nav-link-custom">Shop</Link>

            <button className="nav-icon-btn d-none d-lg-flex" onClick={toggleTheme} title="Toggle theme">
              {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
            </button>

            {isAuthenticated && (
              <Link to="/wishlist" className="nav-icon-btn d-none d-lg-flex" title="Wishlist">
                <FiHeart size={18} />
              </Link>
            )}

            <Link to="/cart" className="nav-icon-btn position-relative d-none d-lg-flex" title="Cart">
              <FiShoppingCart size={18} />
              {itemCount > 0 && <Badge bg="danger" pill className="cart-badge">{itemCount}</Badge>}
            </Link>

            {isAuthenticated ? (
              <Dropdown align="end">
                <Dropdown.Toggle as="button" className="nav-user-btn">
                  <div className="nav-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
                  <span className="d-none d-lg-inline" style={{ color: 'var(--text-primary)' }}>
                    {user?.name?.split(' ')[0]}
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-custom">
                  <Dropdown.Item as={Link} to="/profile">
                    <FiUser className="me-2" style={{ color: 'var(--text-secondary)' }} />Profile
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/settings">
                    <FiSettings className="me-2" style={{ color: 'var(--text-secondary)' }} />Settings
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/orders">
                    <FiPackage className="me-2" style={{ color: 'var(--text-secondary)' }} />Orders
                  </Dropdown.Item>
                  {isAdmin && (
                    <Dropdown.Item as={Link} to="/admin/dashboard">
                      <FiSettings className="me-2" style={{ color: 'var(--text-secondary)' }} />Admin Panel
                    </Dropdown.Item>
                  )}
                  <Dropdown.Divider style={{ borderColor: 'var(--border)' }} />
                  <Dropdown.Item onClick={handleLogout}>
                    <FiLogOut className="me-2" style={{ color: 'var(--text-secondary)' }} />Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <div className="d-flex gap-2 ms-2">
                <Link to="/login" className="btn btn-outline-custom btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary-custom btn-sm">Sign Up</Link>
              </div>
            )}
          </Nav>
        </BSNavbar.Collapse>

        {showSearch && (
          <div className="mobile-search d-lg-none w-100 mt-2">
            <SearchBar onSearch={() => setShowSearch(false)} />
          </div>
        )}
      </Container>
    </BSNavbar>
  );
};

export default Navbar;