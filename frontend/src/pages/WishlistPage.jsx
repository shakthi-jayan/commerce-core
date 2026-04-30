import { useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiTrash2, FiShoppingCart, FiHeart } from 'react-icons/fi';
import { fetchWishlist, toggleWishlistItem } from '../redux/slices/wishlistSlice';
import useCart from '../hooks/useCart';
import { formatPrice, getDiscountPercentage } from '../utils/helpers';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import Loader from '../components/common/Loader';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((s) => s.wishlist);
  const { add } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, dispatch]);

  const handleRemove = async (productId) => {
    try {
      await dispatch(toggleWishlistItem(productId)).unwrap();
      dispatch(fetchWishlist());
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await add(product._id, 1);
      toast.success(`${product.name} added to cart`);
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) return <div className="page-wrapper"><Loader text="Loading wishlist..." /></div>;

  return (
    <div className="page-wrapper" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Container className="py-5">
        <div className="d-flex align-items-center gap-3 mb-4">
          <FiHeart size={28} style={{ color: 'var(--primary)' }} />
          <h2 className="mb-0" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>My Wishlist</h2>
          {products.length > 0 && (
            <span style={{
              background: 'var(--primary-50, rgba(0,122,255,0.08))',
              color: 'var(--primary)',
              padding: '4px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}>
              {products.length} {products.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>
        
        {error && <Alert variant="warning" style={{ borderRadius: 'var(--radius-md)' }}>{error}</Alert>}

        {!loading && !error && products.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '80px 24px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border)',
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'var(--primary-50, rgba(0,122,255,0.08))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <FiHeart size={36} style={{ color: 'var(--primary)', opacity: 0.6 }} />
            </div>
            <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Your wishlist is empty</h4>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>Save items you love and buy them later.</p>
            <Button
              as={Link}
              to="/shop"
              style={{
                background: 'var(--primary)',
                border: 'none',
                padding: '12px 32px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
              }}
            >
              Explore Products
            </Button>
          </div>
        )}

        <Row className="g-4">
          {products.map((product) => {
            const discount = getDiscountPercentage(product.price, product.compareAtPrice);
            return (
              <Col key={product._id} sm={6} md={4} lg={3}>
                <div style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}>
                  {discount > 0 && (
                    <div style={{
                      position: 'absolute', top: '12px', left: '12px', zIndex: 2,
                      background: 'var(--danger)', color: 'white',
                      fontSize: '0.7rem', fontWeight: 700,
                      padding: '4px 10px', borderRadius: '20px',
                    }}>
                      -{discount}%
                    </div>
                  )}
                  <button
                    onClick={() => handleRemove(product._id)}
                    style={{
                      position: 'absolute', top: '12px', right: '12px', zIndex: 2,
                      width: '34px', height: '34px', borderRadius: '50%',
                      background: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'var(--danger)',
                      transition: 'all 0.2s ease',
                    }}
                    title="Remove from wishlist"
                  >
                    <FiTrash2 size={15} />
                  </button>

                  <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      aspectRatio: '4/3', padding: '20px',
                      background: 'var(--bg-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <img
                        src={product.images?.[0]?.url || '/placeholder.png'}
                        alt={product.name}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ padding: '16px' }}>
                      <h6 style={{
                        fontSize: '0.95rem', fontWeight: 600,
                        color: 'var(--text-primary)', marginBottom: '10px',
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {product.name}
                      </h6>
                      <div className="d-flex align-items-baseline gap-2">
                        <span style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700 }}>
                          {formatPrice(product.price)}
                        </span>
                        {product.compareAtPrice > product.price && (
                          <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            {formatPrice(product.compareAtPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div style={{ padding: '0 16px 16px', marginTop: 'auto' }}>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: '1px solid var(--primary)',
                        color: 'var(--primary)',
                        borderRadius: 'var(--radius-full)',
                        padding: '10px',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => { e.target.style.background = 'var(--primary)'; e.target.style.color = 'white'; }}
                      onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--primary)'; }}
                    >
                      <FiShoppingCart size={16} /> Add to Cart
                    </Button>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </Container>
    </div>
  );
};

export default WishlistPage;
