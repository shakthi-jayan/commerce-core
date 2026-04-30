import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder } from '../redux/slices/orderSlice';
import { fetchAddresses, addAddress } from '../redux/slices/addressSlice';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import useRazorpay from '../hooks/useRazorpay';
import { formatPrice } from '../utils/helpers';
import { PAYMENT_METHODS } from '../utils/constants';
import { FiMapPin, FiPlus, FiEdit2, FiCheck, FiChevronRight, FiShoppingBag, FiCreditCard, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AddressModal from '../components/common/AddressModal';

const STEPS = [
  { key: 'address', label: 'Address', icon: FiMapPin },
  { key: 'payment', label: 'Payment', icon: FiCreditCard },
  { key: 'review', label: 'Review', icon: FiPackage },
];

const CheckoutPage = () => {
  const { items, totalPrice } = useCart();
  const { user } = useAuth();
  const { initiatePayment, loading: payLoading } = useRazorpay();
  const dispatch = useDispatch();
  const { loading } = useSelector((s) => s.orders);
  const { addresses, loading: addressesLoading } = useSelector((s) => s.address);
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [useSameAsBilling, setUseSameAsBilling] = useState(true);

  
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const shippingPrice = totalPrice > 500 ? 0 : 50;
  const taxPrice = Math.round(totalPrice * 0.18 * 100) / 100;
  const orderTotal = totalPrice + taxPrice + shippingPrice;

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find(a => a.isDefault);
      setSelectedAddressId(defaultAddr?._id || addresses[0]._id);
    }
  }, [addresses, selectedAddressId]);

  const selectedAddress = addresses.find(a => a._id === selectedAddressId);

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (formData) => {
    try {
      const result = await dispatch(addAddress(formData)).unwrap();
      setShowAddressModal(false);
      
      if (result.length > 0) {
        setSelectedAddressId(result[result.length - 1]._id);
      }
      toast.success('Address added');
    } catch (err) {
      toast.error(err || 'Failed to save address');
    }
  };

  const handleNextStep = () => {
    if (step === 0 && !selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }
    setStep(step + 1);
  };

  const handleOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      setStep(0);
      return;
    }

    const shippingAddress = {
      fullName: selectedAddress.fullName,
      addressLine1: selectedAddress.addressLine1,
      addressLine2: selectedAddress.addressLine2,
      city: selectedAddress.city,
      state: selectedAddress.state,
      postalCode: selectedAddress.postalCode,
      country: selectedAddress.country,
      phoneNumber: selectedAddress.phoneNumber,
    };

    const orderData = {
      orderItems: items.map((i) => ({ product: i.product._id, quantity: i.quantity })),
      shippingAddress,
      paymentMethod,
    };

    const result = await dispatch(createOrder(orderData));
    if (result.meta.requestStatus === 'fulfilled') {
      const order = result.payload;
      if (paymentMethod === 'razorpay') {
        initiatePayment({
          amount: order.totalPrice, orderId: order._id, user,
          onSuccess: () => { toast.success('Payment successful!'); navigate(`/orders/${order._id}`); },
          onFailure: (msg) => { toast.error(msg || 'Payment failed'); navigate(`/orders/${order._id}`); },
        });
      } else {
        toast.success('Order placed!');
        navigate(`/orders/${order._id}`);
      }
    } else {
      toast.error(result.payload || 'Order failed');
    }
  };

  if (!items?.length) {
    return (
      <div className="page-wrapper">
        <Container className="py-5" style={{ textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'var(--primary-50, rgba(0,122,255,0.08))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '40px auto 20px',
          }}>
            <FiShoppingBag size={32} style={{ color: 'var(--primary)', opacity: 0.6 }} />
          </div>
          <h3 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Your cart is empty</h3>
          <p style={{ color: 'var(--text-muted)' }}>Add items to your cart to checkout</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Container className="py-5">
        <h1 style={{ fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>Checkout</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.9rem' }}>
          Complete your order in 3 easy steps
        </p>

        {/* Step Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '40px',
          gap: '0',
        }}>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isCompleted = i < step;
            return (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  onClick={() => { if (isCompleted) setStep(i); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    cursor: isCompleted ? 'pointer' : 'default',
                    background: isActive
                      ? 'var(--primary)'
                      : isCompleted
                        ? 'var(--primary-50, rgba(0,122,255,0.08))'
                        : 'var(--bg-secondary)',
                    color: isActive
                      ? 'white'
                      : isCompleted
                        ? 'var(--primary)'
                        : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isCompleted ? <FiCheck size={16} /> : <Icon size={16} />}
                  {s.label}
                </button>
                {i < STEPS.length - 1 && (
                  <FiChevronRight size={16} style={{ color: 'var(--text-muted)', margin: '0 8px' }} />
                )}
              </div>
            );
          })}
        </div>

        <Row className="g-4">
          <Col lg={8}>
            {/* Step 1: Address Selection */}
            {step === 0 && (
              <div style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border)',
                padding: '28px',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    <FiMapPin className="me-2" style={{ color: 'var(--primary)' }} />
                    Select Delivery Address
                  </h5>
                  <Button
                    onClick={handleAddNewAddress}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--primary)',
                      color: 'var(--primary)',
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <FiPlus size={14} /> Add New
                  </Button>
                </div>

                {addressesLoading && addresses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spinner animation="border" style={{ color: 'var(--primary)' }} />
                  </div>
                ) : addresses.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '48px 24px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                  }}>
                    <FiMapPin size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                    <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
                      No saved addresses. Add one to continue.
                    </p>
                    <Button
                      onClick={handleAddNewAddress}
                      style={{
                        background: 'var(--primary)',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 600,
                      }}
                    >
                      <FiPlus size={16} className="me-2" /> Add Address
                    </Button>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr._id}
                        onClick={() => setSelectedAddressId(addr._id)}
                        style={{
                          padding: '20px',
                          borderRadius: 'var(--radius-lg)',
                          border: selectedAddressId === addr._id
                            ? '2px solid var(--primary)'
                            : '1px solid var(--border)',
                          background: selectedAddressId === addr._id
                            ? 'var(--primary-50, rgba(0,122,255,0.04))'
                            : 'var(--bg-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          position: 'relative',
                        }}
                      >
                        <div className="d-flex align-items-start gap-3">
                          <div style={{
                            width: '22px', height: '22px', borderRadius: '50%',
                            border: selectedAddressId === addr._id
                              ? '6px solid var(--primary)'
                              : '2px solid var(--border)',
                            flexShrink: 0,
                            marginTop: '2px',
                            transition: 'all 0.2s ease',
                          }} />
                          <div style={{ flex: 1 }}>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                {addr.fullName}
                              </span>
                              {addr.isDefault && (
                                <span style={{
                                  background: 'var(--primary)',
                                  color: 'white',
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: 'var(--radius-full)',
                                }}>
                                  Default
                                </span>
                              )}
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px', lineHeight: 1.5 }}>
                              {addr.addressLine1}
                              {addr.addressLine2 && `, ${addr.addressLine2}`}
                              <br />
                              {addr.city}, {addr.state} - {addr.postalCode}, {addr.country}
                            </p>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                              📞 {addr.phoneNumber}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="d-flex justify-content-end mt-4">
                  <Button
                    onClick={handleNextStep}
                    disabled={!selectedAddressId}
                    style={{
                      background: 'var(--primary)',
                      border: 'none',
                      padding: '12px 32px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    Continue to Payment <FiChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 1 && (
              <div style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border)',
                padding: '28px',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px' }}>
                  <FiCreditCard className="me-2" style={{ color: 'var(--primary)' }} />
                  Payment Method
                </h5>

                <div className="d-flex flex-column gap-3 mb-4">
                  {PAYMENT_METHODS.map((m) => (
                    <div
                      key={m.value}
                      onClick={() => setPaymentMethod(m.value)}
                      style={{
                        padding: '20px',
                        borderRadius: 'var(--radius-lg)',
                        border: paymentMethod === m.value
                          ? '2px solid var(--primary)'
                          : '1px solid var(--border)',
                        background: paymentMethod === m.value
                          ? 'var(--primary-50, rgba(0,122,255,0.04))'
                          : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <div style={{
                        width: '22px', height: '22px', borderRadius: '50%',
                        border: paymentMethod === m.value
                          ? '6px solid var(--primary)'
                          : '2px solid var(--border)',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                      }} />
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>

                <Form.Check
                  type="checkbox"
                  id="sameAsBilling"
                  label="Use shipping address as billing address"
                  checked={useSameAsBilling}
                  onChange={(e) => setUseSameAsBilling(e.target.checked)}
                  style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}
                />

                <div className="d-flex justify-content-between">
                  <Button
                    onClick={() => setStep(0)}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      padding: '12px 24px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 500,
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    style={{
                      background: 'var(--primary)',
                      border: 'none',
                      padding: '12px 32px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    Review Order <FiChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 2 && (
              <div style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border)',
                padding: '28px',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px' }}>
                  <FiPackage className="me-2" style={{ color: 'var(--primary)' }} />
                  Review Your Order
                </h5>

                {/* Shipping Address Review */}
                {selectedAddress && (
                  <div style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-secondary)',
                    marginBottom: '20px',
                  }}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Shipping Address
                      </span>
                      <button
                        onClick={() => setStep(0)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--primary)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <FiEdit2 size={12} /> Change
                      </button>
                    </div>
                    <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '0', lineHeight: 1.6 }}>
                      <strong>{selectedAddress.fullName}</strong><br />
                      {selectedAddress.addressLine1}
                      {selectedAddress.addressLine2 && `, ${selectedAddress.addressLine2}`}<br />
                      {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postalCode}<br />
                      {selectedAddress.country} &nbsp; 📞 {selectedAddress.phoneNumber}
                    </p>
                  </div>
                )}

                {/* Payment Method Review */}
                <div style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  marginBottom: '20px',
                }}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Payment Method
                    </span>
                    <button
                      onClick={() => setStep(1)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <FiEdit2 size={12} /> Change
                    </button>
                  </div>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: 0, fontWeight: 500 }}>
                    {PAYMENT_METHODS.find(m => m.value === paymentMethod)?.label}
                  </p>
                </div>

                {/* Order Items */}
                <div style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  marginBottom: '24px',
                }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '16px' }}>
                    Order Items ({items.length})
                  </span>
                  {items.map((item) => (
                    <div key={item._id} className="d-flex align-items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                      <img
                        src={item.product?.images?.[0]?.url || '/placeholder.png'}
                        alt={item.product?.name}
                        style={{
                          width: '48px', height: '48px',
                          borderRadius: 'var(--radius-sm)',
                          objectFit: 'cover',
                          background: 'var(--bg-card)',
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                          {item.product?.name}
                        </p>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</span>
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-between">
                  <Button
                    onClick={() => setStep(1)}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      padding: '12px 24px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 500,
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleOrder}
                    disabled={loading || payLoading}
                    style={{
                      background: 'var(--primary)',
                      border: 'none',
                      padding: '12px 32px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }}
                  >
                    {loading || payLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Processing...
                      </>
                    ) : paymentMethod === 'razorpay' ? (
                      `Pay ${formatPrice(orderTotal)}`
                    ) : (
                      'Place Order'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Col>

          {/* Order Summary Sidebar */}
          <Col lg={4}>
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
              position: 'sticky',
              top: '88px',
            }}>
              <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>
                <FiShoppingBag className="me-2" style={{ color: 'var(--primary)' }} />
                Order Summary
              </h5>

              <div className="d-flex flex-column gap-2 mb-3">
                {items.map((i) => (
                  <div key={i._id} className="d-flex justify-content-between" style={{ fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)', flex: 1, paddingRight: '8px' }}>
                      {i.product?.name} <span style={{ color: 'var(--text-muted)' }}>×{i.quantity}</span>
                    </span>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{formatPrice(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>

              <hr style={{ borderColor: 'var(--border)', margin: '16px 0' }} />

              <div className="d-flex flex-column gap-2" style={{ fontSize: '0.85rem' }}>
                <div className="d-flex justify-content-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                  <span style={{ color: 'var(--text-primary)' }}>{formatPrice(totalPrice)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Tax (18%)</span>
                  <span style={{ color: 'var(--text-primary)' }}>{formatPrice(taxPrice)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
                  <span style={{ color: shippingPrice === 0 ? 'var(--success)' : 'var(--text-primary)', fontWeight: shippingPrice === 0 ? 600 : 400 }}>
                    {shippingPrice === 0 ? 'Free' : formatPrice(shippingPrice)}
                  </span>
                </div>
              </div>

              <hr style={{ borderColor: 'var(--border)', margin: '16px 0' }} />

              <div className="d-flex justify-content-between mb-1">
                <strong style={{ color: 'var(--text-primary)' }}>Total</strong>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {formatPrice(orderTotal)}
                </span>
              </div>

              {shippingPrice === 0 && (
                <p style={{
                  background: 'var(--success-bg)',
                  color: 'var(--success)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  marginTop: '12px',
                  marginBottom: 0,
                  textAlign: 'center',
                }}>
                  🎉 You saved ₹50 on shipping!
                </p>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      {/* Address Modal */}
      <AddressModal
        show={showAddressModal}
        onHide={() => setShowAddressModal(false)}
        onSave={handleSaveAddress}
        address={editingAddress}
        loading={addressesLoading}
      />
    </div>
  );
};

export default CheckoutPage;
