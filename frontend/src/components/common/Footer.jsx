import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiGithub, FiTwitter, FiInstagram } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: 'var(--space-12) 0 var(--space-6)', marginTop: '30px' }}>
      <Container>
        <Row className="g-4 mb-5">
          <Col lg={4} md={6}>
            <h5 className="gradient-text mb-3" style={{ fontWeight: 800, fontSize: 'var(--font-size-xl)' }}>🛒 CodeCommerce</h5>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8, maxWidth: '320px' }}>
              Your premium destination for quality products at unbeatable prices. Shop with confidence.
            </p>
            <div className="d-flex gap-3 mt-3">
              {[FiGithub, FiTwitter, FiInstagram].map((Icon, i) => (
                <a key={i} href="#" className="nav-icon-btn" style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </Col>
          <Col lg={2} md={6}>
            <h6 style={{ fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Quick Links</h6>
            {['Shop', 'About', 'Contact', 'FAQ'].map((item) => (
              <Link key={item} to={`/${item.toLowerCase()}`} className="d-block mb-2" style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{item}</Link>
            ))}
          </Col>
          <Col lg={3} md={6}>
            <h6 style={{ fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Customer Service</h6>
            {['Shipping Info', 'Returns', 'Privacy Policy', 'Terms of Service'].map((item) => (
              <Link key={item} to="#" className="d-block mb-2" style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{item}</Link>
            ))}
          </Col>
          <Col lg={3} md={6}>
            <h6 style={{ fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Contact Us</h6>
            <div className="d-flex flex-column gap-3" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
              <span className="d-flex align-items-center gap-2"><FiMapPin size={14} /> Mumbai, India</span>
              <span className="d-flex align-items-center gap-2"><FiPhone size={14} /> +91 98765 43210</span>
              <span className="d-flex align-items-center gap-2"><FiMail size={14} /> hello@codecommerce.com</span>
            </div>
          </Col>
        </Row>
        <hr style={{ borderColor: 'var(--border)' }} />
        <p className="text-center mb-0" style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
          © {new Date().getFullYear()} CodeCommerce. All rights reserved.
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
