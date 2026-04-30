import { useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import { formatPrice, getMainImage } from '../utils/helpers';
import Loader from '../components/common/Loader';

const CartPage = () => {
  const { items, totalPrice, loading, loadCart, updateQty, remove, clear } = useCart();
  const { isAuthenticated } = useAuth();
  useEffect(() => { if (isAuthenticated) loadCart(); }, [isAuthenticated]);

  if (loading) return <div className="page-wrapper"><Loader /></div>;

  return (
    <div className="page-wrapper">
      <Container className="py-5">
        <h1 style={{ fontWeight: 800, marginBottom: 32 }}>Shopping Cart</h1>
        {!items?.length ? (
          <div className="text-center py-5">
            <FiShoppingBag size={64} style={{ color: 'var(--text-muted)' }} />
            <h3 className="mt-3">Your cart is empty</h3>
            <Link to="/shop" className="btn btn-primary-custom mt-3">Start Shopping</Link>
          </div>
        ) : (
          <Row className="g-4">
            <Col lg={8}>
              {items.map((item) => (
                <div key={item._id} className="card-custom p-3 mb-3 d-flex align-items-center gap-3">
                  <img src={getMainImage(item.product?.images)} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                  <div className="flex-grow-1">
                    <Link to={`/product/${item.product?._id}`} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.product?.name}</Link>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', margin: 0 }}>{formatPrice(item.price)}</p>
                  </div>
                  <div className="d-flex align-items-center gap-1" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <button onClick={() => updateQty(item.product?._id, item.quantity - 1)} className="nav-icon-btn" style={{ width: 32, height: 32 }}><FiMinus size={12} /></button>
                    <span style={{ width: 30, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.product?._id, item.quantity + 1)} className="nav-icon-btn" style={{ width: 32, height: 32 }}><FiPlus size={12} /></button>
                  </div>
                  <span className="price" style={{ fontSize: 'var(--font-size-base)', minWidth: 80, textAlign: 'right' }}>{formatPrice(item.price * item.quantity)}</span>
                  <button onClick={() => remove(item.product?._id)} className="nav-icon-btn" style={{ color: 'var(--danger)' }}><FiTrash2 size={16} /></button>
                </div>
              ))}
              <Button variant="link" onClick={clear} style={{ color: 'var(--danger)', textDecoration: 'none' }}><FiTrash2 className="me-1" /> Clear</Button>
            </Col>
            <Col lg={4}>
              <div className="card-custom p-4" style={{ position: 'sticky', top: 88 }}>
                <h5 style={{ fontWeight: 700 }}>Summary</h5>
                <div className="d-flex justify-content-between my-2"><span>Items ({items.length})</span><span>{formatPrice(totalPrice)}</span></div>
                <div className="d-flex justify-content-between my-2"><span>Shipping</span><span style={{ color: 'var(--success)' }}>{totalPrice > 500 ? 'Free' : '₹50'}</span></div>
                <hr />
                <div className="d-flex justify-content-between mb-3"><strong>Total</strong><span className="price">{formatPrice(totalPrice > 500 ? totalPrice : totalPrice + 50)}</span></div>
                <Link to="/checkout" className="btn btn-primary-custom w-100">Checkout <FiArrowRight className="ms-2" /></Link>
              </div>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default CartPage;
