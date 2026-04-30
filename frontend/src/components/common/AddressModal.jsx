import { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Button, Spinner } from 'react-bootstrap';
import { FiMapPin } from 'react-icons/fi';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
];

const EMPTY_ADDRESS = {
  fullName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  phoneNumber: '',
  isDefault: false,
};

const AddressModal = ({ show, onHide, onSave, address = null, loading = false }) => {
  const [form, setForm] = useState(EMPTY_ADDRESS);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (address) {
      setForm({ ...EMPTY_ADDRESS, ...address });
    } else {
      setForm(EMPTY_ADDRESS);
    }
    setErrors({});
  }, [address, show]);

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.addressLine1.trim()) errs.addressLine1 = 'Address line 1 is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.state.trim()) errs.state = 'State is required';
    if (!form.postalCode.trim()) errs.postalCode = 'Postal code is required';
    else if (!/^\d{6}$/.test(form.postalCode.trim())) errs.postalCode = 'Enter a valid 6-digit PIN code';
    if (!form.phoneNumber.trim()) errs.phoneNumber = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(form.phoneNumber.trim())) errs.phoneNumber = 'Enter a valid 10-digit phone number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const inputStyle = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
  };

  const errorInputStyle = {
    ...inputStyle,
    borderColor: 'var(--danger)',
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
      <Modal.Header
        closeButton
        style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          padding: '20px 24px',
        }}
      >
        <Modal.Title style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FiMapPin size={20} style={{ color: 'var(--primary)' }} />
          {address ? 'Edit Address' : 'Add New Address'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: 'var(--bg-card)', padding: '24px' }}>
        <Form onSubmit={handleSubmit} id="address-form">
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Full Name <span style={{ color: 'var(--danger)' }}>*</span>
                </Form.Label>
                <Form.Control
                  style={errors.fullName ? errorInputStyle : inputStyle}
                  value={form.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="John Doe"
                />
                {errors.fullName && <small style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.fullName}</small>}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Phone Number <span style={{ color: 'var(--danger)' }}>*</span>
                </Form.Label>
                <Form.Control
                  style={errors.phoneNumber ? errorInputStyle : inputStyle}
                  value={form.phoneNumber}
                  onChange={(e) => handleChange('phoneNumber', e.target.value)}
                  placeholder="9876543210"
                  maxLength={10}
                />
                {errors.phoneNumber && <small style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.phoneNumber}</small>}
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Address Line 1 <span style={{ color: 'var(--danger)' }}>*</span>
                </Form.Label>
                <Form.Control
                  style={errors.addressLine1 ? errorInputStyle : inputStyle}
                  value={form.addressLine1}
                  onChange={(e) => handleChange('addressLine1', e.target.value)}
                  placeholder="House/Flat No., Building, Street"
                />
                {errors.addressLine1 && <small style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.addressLine1}</small>}
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Address Line 2 <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                </Form.Label>
                <Form.Control
                  style={inputStyle}
                  value={form.addressLine2}
                  onChange={(e) => handleChange('addressLine2', e.target.value)}
                  placeholder="Landmark, Area"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  City <span style={{ color: 'var(--danger)' }}>*</span>
                </Form.Label>
                <Form.Control
                  style={errors.city ? errorInputStyle : inputStyle}
                  value={form.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Mumbai"
                />
                {errors.city && <small style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.city}</small>}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  State <span style={{ color: 'var(--danger)' }}>*</span>
                </Form.Label>
                <Form.Select
                  style={errors.state ? errorInputStyle : inputStyle}
                  value={form.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </Form.Select>
                {errors.state && <small style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.state}</small>}
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  PIN Code <span style={{ color: 'var(--danger)' }}>*</span>
                </Form.Label>
                <Form.Control
                  style={errors.postalCode ? errorInputStyle : inputStyle}
                  value={form.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  placeholder="400001"
                  maxLength={6}
                />
                {errors.postalCode && <small style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.postalCode}</small>}
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Country
                </Form.Label>
                <Form.Control
                  style={inputStyle}
                  value={form.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Form.Check
                type="switch"
                id="isDefault"
                label="Set as default"
                checked={form.isDefault}
                onChange={(e) => handleChange('isDefault', e.target.checked)}
                style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}
              />
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer
        style={{
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border)',
          padding: '16px 24px',
          gap: '12px',
        }}
      >
        <Button
          variant="light"
          onClick={onHide}
          disabled={loading}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 24px',
            fontWeight: 500,
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="address-form"
          disabled={loading}
          style={{
            background: 'var(--primary)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: '10px 24px',
            fontWeight: 600,
          }}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Saving...
            </>
          ) : (
            address ? 'Update Address' : 'Save Address'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddressModal;
