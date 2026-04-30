import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import { fetchOrder, clearOrder } from '../redux/slices/orderSlice';
import { formatPrice, formatDateTime } from '../utils/helpers';
import { ORDER_STATUS_COLORS } from '../utils/constants';
import Loader from '../components/common/Loader';

const OrderDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { order, loading } = useSelector((s) => s.orders);
  useEffect(() => { dispatch(fetchOrder(id)); return () => { dispatch(clearOrder()); }; }, [dispatch, id]);

  if (loading || !order) return <div className="page-wrapper"><Loader /></div>;

  return (
    <div className="page-wrapper">
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div><h1 style={{ fontWeight: 800 }}>Order {order.orderNumber}</h1><p style={{ color: 'var(--text-muted)' }}>Placed on {formatDateTime(order.createdAt)}</p></div>
          <Badge bg={ORDER_STATUS_COLORS[order.status]} style={{ fontSize: 'var(--font-size-sm)', padding: '8px 16px' }}>{order.status}</Badge>
        </div>
        <Row className="g-4">
          <Col lg={8}>
            <div className="card-custom p-4 mb-4">
              <h5 style={{ fontWeight: 700 }}>Items</h5>
              {order.orderItems?.map((item, i) => (
                <div key={i} className="d-flex align-items-center gap-3 py-3" style={{ borderBottom: i < order.orderItems.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <img src={item.image || '/placeholder-product.png'} alt={item.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                  <div className="flex-grow-1"><strong>{item.name}</strong><br /><small>Qty: {item.quantity}</small></div>
                  <span className="price" style={{ fontSize: 'var(--font-size-base)' }}>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="card-custom p-4">
              <h5 style={{ fontWeight: 700 }}>Shipping</h5>
              <p className="mb-1" style={{ fontWeight: 600 }}>{order.shippingAddress?.fullName}</p>
              <p className="mb-1">{order.shippingAddress?.addressLine1}{order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}</p>
              <p className="mb-1">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}</p>
              <p>{order.shippingAddress?.country} — 📞 {order.shippingAddress?.phoneNumber}</p>
            </div>
          </Col>
          <Col lg={4}>
            <div className="card-custom p-4">
              <h5 style={{ fontWeight: 700 }}>Summary</h5>
              <div className="d-flex justify-content-between my-2"><span>Subtotal</span><span>{formatPrice(order.itemsPrice)}</span></div>
              <div className="d-flex justify-content-between my-2"><span>Tax</span><span>{formatPrice(order.taxPrice)}</span></div>
              <div className="d-flex justify-content-between my-2"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : formatPrice(order.shippingPrice)}</span></div>
              <hr />
              <div className="d-flex justify-content-between"><strong>Total</strong><span className="price">{formatPrice(order.totalPrice)}</span></div>
              <div className="mt-3"><small>Payment: {order.paymentMethod}</small><br /><small>Paid: {order.isPaid ? `Yes — ${formatDateTime(order.paidAt)}` : 'No'}</small></div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default OrderDetailPage;
