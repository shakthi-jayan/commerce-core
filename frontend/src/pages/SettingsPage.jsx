import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Tab, Nav, Spinner } from 'react-bootstrap';
import { FiUser, FiMapPin, FiPlus, FiEdit2, FiTrash2, FiCheck, FiSettings } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../redux/slices/addressSlice';
import useAuth from '../hooks/useAuth';
import userService from '../services/userService';
import toast from 'react-hot-toast';
import AddressModal from '../components/common/AddressModal';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';

const SettingsPage = () => {
  const { user, fetchMe } = useAuth();
  const dispatch = useDispatch();
  const { addresses, loading: addressLoading } = useSelector((s) => s.address);

  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileLoading, setProfileLoading] = useState(false);

  
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const handleProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
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
    setProfileLoading(false);
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddressModal(true);
  };

  const handleEditAddress = (addr) => {
    setEditingAddress(addr);
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (formData) => {
    try {
      if (editingAddress) {
        await dispatch(updateAddress({ id: editingAddress._id, addressData: formData })).unwrap();
        toast.success('Address updated');
      } else {
        await dispatch(addAddress(formData)).unwrap();
        toast.success('Address added');
      }
      setShowAddressModal(false);
      setEditingAddress(null);
    } catch (err) {
      toast.error(err || 'Failed to save address');
    }
  };

  const handleDeleteClick = (addressId) => {
    setDeletingAddressId(addressId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await dispatch(deleteAddress(deletingAddressId)).unwrap();
      toast.success('Address deleted');
      setShowDeleteModal(false);
      setDeletingAddressId(null);
    } catch (err) {
      toast.error(err || 'Failed to delete address');
    }
    setDeleteLoading(false);
  };

  const handleSetDefault = async (addressId) => {
    try {
      await dispatch(setDefaultAddress(addressId)).unwrap();
      toast.success('Default address updated');
    } catch (err) {
      toast.error(err || 'Failed to set default');
    }
  };

  const inputStyle = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px',
    fontSize: '0.9rem',
  };

  return (
    <div className="page-wrapper" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Container className="py-5">
        <div className="d-flex align-items-center gap-3 mb-4">
          <FiSettings size={28} style={{ color: 'var(--primary)' }} />
          <h1 style={{ fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Settings</h1>
        </div>

        <Tab.Container defaultActiveKey="profile">
          <Row className="g-4">
            <Col md={3}>
              <div style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: '8px',
                position: 'sticky',
                top: '88px',
              }}>
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link
                      eventKey="profile"
                      style={{
                        color: 'var(--text-primary)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 16px',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <FiUser size={18} /> Profile
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="addresses"
                      style={{
                        color: 'var(--text-primary)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 16px',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <FiMapPin size={18} /> Addresses
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </div>
            </Col>

            <Col md={9}>
              <Tab.Content>
                {/* Profile Tab */}
                <Tab.Pane eventKey="profile">
                  <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--border)',
                    padding: '28px',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px' }}>
                      <FiUser className="me-2" size={20} style={{ color: 'var(--primary)' }} />
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
                        disabled={profileLoading}
                        style={{
                          background: 'var(--primary)',
                          border: 'none',
                          padding: '12px 28px',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 600,
                          marginTop: '20px',
                        }}
                      >
                        {profileLoading ? (
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
                </Tab.Pane>

                {/* Addresses Tab */}
                <Tab.Pane eventKey="addresses">
                  <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--border)',
                    padding: '28px',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        <FiMapPin className="me-2" size={20} style={{ color: 'var(--primary)' }} />
                        Saved Addresses
                      </h5>
                      <Button
                        onClick={handleAddAddress}
                        style={{
                          background: 'var(--primary)',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <FiPlus size={16} /> Add Address
                      </Button>
                    </div>

                    {addressLoading && addresses.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '48px' }}>
                        <Spinner animation="border" style={{ color: 'var(--primary)' }} />
                      </div>
                    ) : addresses.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        padding: '60px 24px',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-lg)',
                      }}>
                        <div style={{
                          width: '64px', height: '64px', borderRadius: '50%',
                          background: 'var(--primary-50, rgba(0,122,255,0.08))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          margin: '0 auto 16px',
                        }}>
                          <FiMapPin size={28} style={{ color: 'var(--primary)', opacity: 0.6 }} />
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No addresses saved yet</p>
                        <Button
                          onClick={handleAddAddress}
                          variant="link"
                          style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
                        >
                          Add your first address
                        </Button>
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {addresses.map((addr) => (
                          <div
                            key={addr._id}
                            style={{
                              padding: '20px',
                              borderRadius: 'var(--radius-lg)',
                              border: addr.isDefault ? '2px solid var(--primary)' : '1px solid var(--border)',
                              background: addr.isDefault ? 'var(--primary-50, rgba(0,122,255,0.04))' : 'var(--bg-secondary)',
                              transition: 'all 0.2s ease',
                              position: 'relative',
                            }}
                          >
                            {addr.isDefault && (
                              <span style={{
                                position: 'absolute', top: '12px', right: '12px',
                                background: 'var(--primary)', color: 'white',
                                fontSize: '0.7rem', fontWeight: 700,
                                padding: '3px 10px', borderRadius: 'var(--radius-full)',
                                display: 'flex', alignItems: 'center', gap: '4px',
                              }}>
                                <FiCheck size={12} /> Default
                              </span>
                            )}
                            <div style={{ marginBottom: '8px' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                {addr.fullName}
                              </span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '12px' }}>
                                {addr.phoneNumber}
                              </span>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px', lineHeight: 1.6 }}>
                              {addr.addressLine1}
                              {addr.addressLine2 && `, ${addr.addressLine2}`}
                              <br />
                              {addr.city}, {addr.state} - {addr.postalCode}
                              <br />
                              {addr.country}
                            </p>
                            <div className="d-flex gap-2">
                              <button
                                onClick={() => handleEditAddress(addr)}
                                style={{
                                  background: 'transparent',
                                  border: '1px solid var(--border)',
                                  padding: '6px 14px',
                                  borderRadius: 'var(--radius-md)',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: 500,
                                  color: 'var(--text-primary)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <FiEdit2 size={13} /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteClick(addr._id)}
                                style={{
                                  background: 'transparent',
                                  border: '1px solid var(--danger)',
                                  padding: '6px 14px',
                                  borderRadius: 'var(--radius-md)',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: 500,
                                  color: 'var(--danger)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <FiTrash2 size={13} /> Delete
                              </button>
                              {!addr.isDefault && (
                                <button
                                  onClick={() => handleSetDefault(addr._id)}
                                  style={{
                                    background: 'transparent',
                                    border: '1px solid var(--primary)',
                                    padding: '6px 14px',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    color: 'var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s ease',
                                  }}
                                >
                                  <FiCheck size={13} /> Set Default
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Container>

      {/* Address Modal */}
      <AddressModal
        show={showAddressModal}
        onHide={() => { setShowAddressModal(false); setEditingAddress(null); }}
        onSave={handleSaveAddress}
        address={editingAddress}
        loading={addressLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        show={showDeleteModal}
        onHide={() => { setShowDeleteModal(false); setDeletingAddressId(null); }}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Address"
        message="Are you sure you want to delete this address? This action cannot be undone."
      />
    </div>
  );
};

export default SettingsPage;
