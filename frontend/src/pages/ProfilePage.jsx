import { useState } from 'react';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiUser, FiSettings, FiMapPin, FiShoppingBag, FiHeart } from 'react-icons/fi';
import useAuth from '../hooks/useAuth';
import userService from '../services/userService';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, fetchMe } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (phone) formData.append('phone', phone);
      await userService.updateProfile(formData);
      await fetchMe();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  const inputStyle = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px',
    fontSize: '0.9rem',
  };

  const quickLinks = [
    { to: '/settings', icon: FiSettings, label: 'Settings', desc: 'Manage addresses & preferences' },
    { to: '/orders', icon: FiShoppingBag, label: 'My Orders', desc: 'Track your orders' },
    { to: '/wishlist', icon: FiHeart, label: 'Wishlist', desc: 'Items you saved' },
  ];

  return (
    <div className="page-wrapper" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Container className="py-5">
        <div className="d-flex align-items-center gap-3 mb-4">
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'var(--primary-50, rgba(0,122,255,0.08))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FiUser size={24} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h1 style={{ fontWeight: 800, margin: 0, color: 'var(--text-primary)', fontSize: '1.75rem' }}>
              My Profile
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
              Manage your account details
            </p>
          </div>
        </div>

        <Row className="g-4">
          <Col lg={8}>
            {/* Profile Form */}
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)',
              padding: '28px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px' }}>
                Personal Information
              </h5>
              <Form onSubmit={handleProfile}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Name</Form.Label>
                      <Form.Control style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Email</Form.Label>
                      <Form.Control style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Phone</Form.Label>
                      <Form.Control style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Role</Form.Label>
                      <Form.Control style={{ ...inputStyle, opacity: 0.7 }} value={user?.role} disabled />
                    </Form.Group>
                  </Col>
                </Row>
                <Button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: 'var(--primary)',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 600,
                    marginTop: '20px',
                  }}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </Form>
            </div>
          </Col>

          <Col lg={4}>
            {/* Quick Links */}
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <h6 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Quick Links</h6>
              <div className="d-flex flex-column gap-2">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Icon size={18} style={{ color: 'var(--primary)' }} />
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', display: 'block' }}>
                          {link.label}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {link.desc}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProfilePage;
