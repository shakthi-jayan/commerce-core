import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Button, Badge, Form, Alert } from 'react-bootstrap';
import { FiShoppingCart, FiHeart, FiStar, FiMinus, FiPlus, FiTruck, FiShield, FiRefreshCw, FiMoon, FiSun } from 'react-icons/fi';
import { fetchProduct, clearProduct } from '../redux/slices/productSlice';
import { toggleWishlistItem } from '../redux/slices/wishlistSlice';
import { formatPrice, getDiscountPercentage, getStarArray } from '../utils/helpers';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import productService from '../services/productService';

const ProductPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { product, loading } = useSelector((s) => s.products);
  const wishlistItems = useSelector((s) => s.wishlist.items);
  const inWishlist = wishlistItems.includes(id);
  const { add } = useCart();
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => { 
    dispatch(fetchProduct(id)); 
    loadReviews();
    return () => { dispatch(clearProduct()); }; 
  }, [dispatch, id]);

  const loadReviews = async () => {
    try {
      const { data } = await productService.getReviews(id);
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Failed to load reviews');
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    try {
      const result = await dispatch(toggleWishlistItem(product._id)).unwrap();
      toast.success(result.action === 'added' ? 'Added to wishlist' : 'Removed from wishlist');
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Please login to review');
    if (!reviewForm.comment.trim()) return toast.error('Comment is required');
    
    setSubmittingReview(true);
    try {
      await productService.addReview(product._id, reviewForm);
      toast.success('Review submitted successfully');
      setReviewForm({ rating: 5, comment: '' });
      loadReviews();
      dispatch(fetchProduct(id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
    setSubmittingReview(false);
  };

  if (loading || !product) return (
    <div className="page-wrapper" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader text="Loading product..." />
    </div>
  );

  const discount = getDiscountPercentage(product.price, product.compareAtPrice);
  const images = product.images?.length > 0 ? product.images : [{ url: '/placeholder-product.png' }];

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    try { 
      await add(product._id, qty); 
      toast.success(`${product.name} added to cart!`); 
    } catch { 
      toast.error('Failed to add'); 
    }
  };

  return (
    <div className="page-wrapper" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: 'var(--shadow-md)',
          color: 'var(--text-primary)'
        }}
      >
        {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
      </button>

      <Container className="py-5">
        {/* Product Main Section */}
        <Row className="g-5">
          {/* Left Column - Images */}
          <Col lg={6} xl={7}>
            <div style={{ 
              background: 'var(--bg-card)', 
              borderRadius: 'var(--radius-xl)', 
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border)'
            }}>
              <div style={{ 
                aspectRatio: '4/3', 
                borderRadius: 'var(--radius-lg)', 
                overflow: 'hidden', 
                background: 'var(--bg-secondary)',
                marginBottom: '20px',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}>
                <img 
                  src={images[selectedImage]?.url} 
                  alt={product.name} 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%', 
                    objectFit: 'contain'
                  }} 
                />
              </div>
              
              {images.length > 1 && (
                <div className="d-flex gap-3 overflow-auto pb-2">
                  {images.map((img, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedImage(i)} 
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: 'var(--radius-md)', 
                        overflow: 'hidden', 
                        cursor: 'pointer', 
                        border: i === selectedImage ? '2px solid var(--primary)' : '1px solid var(--border)',
                        flexShrink: 0,
                        padding: '6px',
                        background: 'var(--bg-card)'
                      }}
                    >
                      <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Col>

          {/* Right Column - Product Info */}
          <Col lg={6} xl={5}>
            <div style={{ 
              background: 'var(--bg-card)', 
              borderRadius: 'var(--radius-xl)', 
              padding: '28px', 
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {product.category && (
                <span style={{ 
                  display: 'inline-block',
                  background: 'var(--bg-secondary)', 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.7rem', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '4px 12px', 
                  borderRadius: 'var(--radius-full)',
                  marginBottom: '16px'
                }}>
                  {product.category.name}
                </span>
              )}
              
              <h1 style={{ 
                fontWeight: '700', 
                fontSize: '1.75rem', 
                lineHeight: 1.3, 
                marginBottom: '16px',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em'
              }}>
                {product.name}
              </h1>

              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="d-flex align-items-center gap-1">
                  {getStarArray(product.ratings).map((s, i) => (
                    <FiStar 
                      key={i} 
                      size={16} 
                      className={s === 'empty' ? 'star-empty' : 'star-filled'} 
                      fill={s !== 'empty' ? '#FBBF24' : 'none'} 
                      style={{ color: '#FBBF24' }}
                    />
                  ))}
                </div>
                <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {product.ratings?.toFixed(1)}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  ({product.numReviews || 0} reviews)
                </span>
              </div>

              <div className="d-flex align-items-baseline gap-3 mb-4">
                <span style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  {formatPrice(product.price)}
                </span>
                {discount > 0 && (
                  <>
                    <span style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      {formatPrice(product.compareAtPrice)}
                    </span>
                    <span style={{ 
                      background: 'var(--danger)', 
                      color: 'white', 
                      fontSize: '0.75rem', 
                      fontWeight: '600', 
                      padding: '4px 10px', 
                      borderRadius: 'var(--radius-full)' 
                    }}>
                      {discount}% off
                    </span>
                  </>
                )}
              </div>

              <div style={{ 
                color: 'var(--text-secondary)', 
                lineHeight: 1.7, 
                marginBottom: '24px', 
                fontSize: '0.9rem',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '20px'
              }} 
              dangerouslySetInnerHTML={{ __html: product.description }} 
              />

              <div className="mb-4">
                <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-primary)' }}>Availability: </span>
                {product.stock > 0 ? (
                  <span style={{ 
                    background: 'var(--success-bg)', 
                    color: 'var(--success)', 
                    padding: '4px 12px', 
                    borderRadius: 'var(--radius-full)', 
                    fontSize: '0.75rem', 
                    fontWeight: '600',
                    marginLeft: '8px'
                  }}>
                    In Stock ({product.stock})
                  </span>
                ) : (
                  <span style={{ 
                    background: 'var(--danger-bg)', 
                    color: 'var(--danger)', 
                    padding: '4px 12px', 
                    borderRadius: 'var(--radius-full)', 
                    fontSize: '0.75rem', 
                    fontWeight: '600',
                    marginLeft: '8px'
                  }}>
                    Out of Stock
                  </span>
                )}
              </div>

              {product.stock > 0 && (
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="d-flex align-items-center" style={{ 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius-md)', 
                    overflow: 'hidden',
                    background: 'var(--bg-card)'
                  }}>
                    <button 
                      onClick={() => setQty(Math.max(1, qty - 1))} 
                      style={{ 
                        width: '44px', 
                        height: '44px', 
                        border: 'none', 
                        background: 'var(--bg-secondary)', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <FiMinus size={14} />
                    </button>
                    <span style={{ width: '50px', textAlign: 'center', fontWeight: '600', fontSize: '1rem', color: 'var(--text-primary)' }}>
                      {qty}
                    </span>
                    <button 
                      onClick={() => setQty(Math.min(product.stock, qty + 1))} 
                      style={{ 
                        width: '44px', 
                        height: '44px', 
                        border: 'none', 
                        background: 'var(--bg-secondary)', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>
                  <Button 
                    className="flex-grow-1" 
                    onClick={handleAddToCart}
                    style={{
                      background: 'var(--primary)',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <FiShoppingCart size={18} /> Add to Cart
                  </Button>
                  <button 
                    onClick={handleWishlist} 
                    style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: 'var(--radius-md)', 
                      border: inWishlist ? '2px solid var(--primary)' : '1px solid var(--border)', 
                      background: inWishlist ? 'var(--primary-50, rgba(0,122,255,0.08))' : 'var(--bg-card)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: inWishlist ? 'var(--primary)' : 'var(--text-secondary)',
                      transition: 'all 0.2s ease',
                    }}
                    title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <FiHeart size={20} fill={inWishlist ? 'var(--primary)' : 'none'} />
                  </button>
                </div>
              )}

              <div className="d-flex gap-4 pt-4" style={{ borderTop: '1px solid var(--border)', marginTop: '8px' }}>
                <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <FiTruck size={16} style={{ color: 'var(--primary)' }} /> Free Delivery
                </div>
                <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <FiShield size={16} style={{ color: 'var(--primary)' }} /> Secure Payment
                </div>
                <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <FiRefreshCw size={16} style={{ color: 'var(--primary)' }} /> 30-day Returns
                </div>
              </div>

              {product.sku && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '20px', marginBottom: '0' }}>
                  SKU: {product.sku}
                </p>
              )}
            </div>
          </Col>
        </Row>

        {/* Reviews Section */}
        <div className="mt-5 pt-4">
          <Row className="g-5">
            <Col lg={7}>
              <div style={{ 
                background: 'var(--bg-card)', 
                borderRadius: 'var(--radius-xl)', 
                padding: '28px', 
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h3 style={{ fontWeight: '700', fontSize: '1.25rem', marginBottom: '24px', color: 'var(--text-primary)' }}>
                  Customer Reviews
                  <span style={{ fontSize: '0.85rem', fontWeight: '400', color: 'var(--text-muted)', marginLeft: '10px' }}>
                    ({reviews.length} reviews)
                  </span>
                </h3>
                
                {reviews.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '48px 24px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--text-muted)'
                  }}>
                    <FiStar size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                    <p style={{ marginBottom: 0 }}>No reviews yet. Be the first to review this product!</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-4">
                    {reviews.map(review => (
                      <div key={review._id} style={{ 
                        padding: '20px', 
                        background: 'var(--bg-secondary)', 
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border)'
                      }}>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <div className="fw-bold" style={{ fontSize: '0.9rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
                              {review.user?.name || 'Customer'}
                            </div>
                            <div className="d-flex gap-1">
                              {getStarArray(review.rating).map((s, i) => (
                                <FiStar 
                                  key={i} 
                                  size={13} 
                                  className={s === 'empty' ? 'star-empty' : 'star-filled'} 
                                  fill={s !== 'empty' ? '#FBBF24' : 'none'} 
                                  style={{ color: '#FBBF24' }}
                                />
                              ))}
                            </div>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        <p style={{ marginBottom: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Col>
            
            <Col lg={5}>
              <div style={{ 
                background: 'var(--bg-card)', 
                borderRadius: 'var(--radius-xl)', 
                padding: '28px', 
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                position: 'sticky',
                top: '100px'
              }}>
                <h5 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '20px', color: 'var(--text-primary)' }}>
                  Write a Review
                </h5>
                {isAuthenticated ? (
                  <Form onSubmit={submitReview}>
                    <Form.Group className="mb-4">
                      <Form.Label style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '8px', color: 'var(--text-primary)' }}>
                        Rating
                      </Form.Label>
                      <Form.Select 
                        value={reviewForm.rating} 
                        onChange={(e) => setReviewForm({...reviewForm, rating: Number(e.target.value)})}
                        style={{
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          padding: '10px 12px',
                          fontSize: '0.85rem',
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Very Good</option>
                        <option value="3">3 - Good</option>
                        <option value="2">2 - Fair</option>
                        <option value="1">1 - Poor</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '8px', color: 'var(--text-primary)' }}>
                        Your Review
                      </Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={5} 
                        required
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                        placeholder="Share your experience with this product..."
                        style={{
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          padding: '12px',
                          fontSize: '0.85rem',
                          resize: 'vertical',
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </Form.Group>
                    <Button 
                      type="submit" 
                      disabled={submittingReview}
                      style={{
                        background: 'var(--primary)',
                        border: 'none',
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: '600',
                        width: '100%'
                      }}
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </Form>
                ) : (
                  <Alert variant="info" style={{ 
                    borderRadius: 'var(--radius-md)', 
                    background: 'var(--info-bg)', 
                    border: '1px solid var(--border)',
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)'
                  }}>
                    Please <a href="/login" style={{ color: 'var(--primary)', fontWeight: '500' }}>login</a> to write a review.
                  </Alert>
                )}
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default ProductPage;