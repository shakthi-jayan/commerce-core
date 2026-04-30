import { useEffect } from 'react';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiPackage, FiEye } from 'react-icons/fi';
import { fetchMyOrders } from '../redux/slices/orderSlice';
import { formatPrice, formatDate } from '../utils/helpers';
import { ORDER_STATUS_COLORS } from '../utils/constants';
import Loader from '../components/common/Loader';
import Pagination from '../components/common/Pagination';

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, loading, currentPage, totalPages } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchMyOrders({ page: 1 })); }, [dispatch]);

  if (loading) return <div className="page-wrapper"><Loader /></div>;

  return (
    <div className="page-wrapper">
      <Container className="py-5">
        <h1 style={{ fontWeight: 800, marginBottom: 32 }}><FiPackage className="me-3" />My Orders</h1>
        {!orders?.length ? (
          <div className="text-center py-5"><h4>No orders yet</h4><Link to="/shop" className="btn btn-primary-custom mt-3">Shop Now</Link></div>
        ) : (
          <>
            {orders.map((order) => (
              <div key={order._id} className="card-custom p-4 mb-3">
                <Row className="align-items-center">
                  <Col md={3}><small style={{ color: 'var(--text-muted)' }}>Order</small><br /><strong>{order.orderNumber}</strong></Col>
                  <Col md={2}><small style={{ color: 'var(--text-muted)' }}>Date</small><br />{formatDate(order.createdAt)}</Col>
                  <Col md={2}><small style={{ color: 'var(--text-muted)' }}>Total</small><br /><span className="price" style={{ fontSize: 'var(--font-size-base)' }}>{formatPrice(order.totalPrice)}</span></Col>
                  <Col md={2}><small style={{ color: 'var(--text-muted)' }}>Status</small><br /><Badge bg={ORDER_STATUS_COLORS[order.status]}>{order.status}</Badge></Col>
                  <Col md={3} className="text-end"><Link to={`/orders/${order._id}`} className="btn btn-outline-custom btn-sm"><FiEye className="me-1" /> View</Link></Col>
                </Row>
              </div>
            ))}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(p) => dispatch(fetchMyOrders({ page: p }))} />
          </>
        )}
      </Container>
    </div>
  );
};

export default OrdersPage;
