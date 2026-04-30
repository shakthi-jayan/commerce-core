import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw, FiHeadphones } from 'react-icons/fi';
import { fetchTopProducts, fetchFeaturedProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/products/ProductCard';
import Loader from '../components/common/Loader';

const HomePage = () => {
  const dispatch = useDispatch();
  const { topProducts, featuredProducts, loading } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchTopProducts(8));
    dispatch(fetchFeaturedProducts());
  }, [dispatch]);

  const features = [
    { icon: FiTruck, title: 'Free Shipping', desc: 'On orders over ₹500' },
    { icon: FiShield, title: 'Secure Payment', desc: '100% protected payments' },
    { icon: FiRefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
    { icon: FiHeadphones, title: '24/7 Support', desc: 'Dedicated support team' },
  ];

  return (
    <div className="page-wrapper">
      {/* Hero Section */}
      <section style={{ background: 'var(--bg-card)', padding: '100px 0', borderBottom: '1px solid var(--border-light)' }}>
        <Container>
          <Row className="align-items-center justify-content-center text-center">
            <Col lg={8}>
              <span className="badge-custom mb-3 d-inline-block" style={{ fontSize: '0.85rem' }}>New Collection</span>
              <h1 style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.05, marginBottom: '24px', letterSpacing: '-0.02em' }}>
                Premium products.<br />For every style.
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
                Explore our curated collection of top-quality products with exclusive deals and fast delivery.
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Link to="/shop" className="btn btn-primary-custom px-4 py-3" style={{ fontSize: '1rem', borderRadius: 'var(--radius-full)' }}>
                  Shop Now
                </Link>
                <Link to="/shop?sort=-ratings" className="btn btn-outline-custom px-4 py-3" style={{ fontSize: '1rem', borderRadius: 'var(--radius-full)' }}>
                  Top Rated
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features */}
      <section style={{ padding: '60px 0', background: 'var(--bg-primary)' }}>
        <Container>
          <Row className="g-5">
            {features.map((f, i) => (
              <Col key={i} md={3} xs={6}>
                <div className="text-center h-100" style={{ transition: 'all var(--transition-fast)' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <f.icon size={28} style={{ color: 'var(--primary)' }} />
                  </div>
                  <h6 style={{ fontWeight: 600, marginBottom: '8px', fontSize: '1rem', color: 'var(--text-primary)' }}>{f.title}</h6>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 0 }}>{f.desc}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Featured Products */}
      {featuredProducts?.length > 0 && (
        <section className="section pb-0">
          <Container>
            <div className="d-flex justify-content-between align-items-end mb-4">
              <div><h2 className="section-title mb-0">Featured</h2><p className="mb-0" style={{ color: 'var(--text-secondary)' }}>Hand-picked just for you</p></div>
              <Link to="/shop?featured=true" className="btn btn-outline-custom btn-sm" style={{ border: 'none', background: 'var(--bg-secondary)' }}>View All <FiArrowRight className="ms-1" /></Link>
            </div>
            {loading ? <Loader /> : (
              <Row className="g-5">
                {featuredProducts.slice(0, 8).map((p) => <Col key={p._id} xs={6} md={4} lg={3}><ProductCard product={p} /></Col>)}
              </Row>
            )}
          </Container>
        </section>
      )}

      {/* Top Rated */}
      {topProducts?.length > 0 && (
        <section className="section">
          <Container>
            <div className="d-flex justify-content-between align-items-end mb-4">
              <div><h2 className="section-title mb-0">Top Rated</h2><p className="mb-0" style={{ color: 'var(--text-secondary)' }}>Loved by our customers</p></div>
              <Link to="/shop?sort=-ratings" className="btn btn-outline-custom btn-sm" style={{ border: 'none', background: 'var(--bg-secondary)' }}>View All <FiArrowRight className="ms-1" /></Link>
            </div>
            <Row className="g-5">
              {topProducts.slice(0, 4).map((p) => <Col key={p._id} xs={6} md={3}><ProductCard product={p} /></Col>)}
            </Row>
          </Container>
        </section>
      )}

      {/* CTA Banner */}
      <section style={{ background: '#000000', padding: '100px 0' }}>
        <Container className="text-center">
          <h2 style={{ color: '#f5f5f7', fontWeight: 600, fontSize: '3rem', marginBottom: '16px', letterSpacing: '-0.02em' }}>Ready to shop?</h2>
          <p style={{ color: '#86868b', fontSize: '1.25rem', marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' }}>Join thousands of happy customers today.</p>
          <Link to="/register" className="btn px-5 py-3" style={{ background: '#ffffff', color: '#000000', borderRadius: 'var(--radius-full)', fontWeight: 500, textDecoration: 'none' }}>Create Account</Link>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;
