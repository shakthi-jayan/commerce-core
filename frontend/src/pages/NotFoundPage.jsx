import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { FiHome } from 'react-icons/fi';

const NotFoundPage = () => (
  <div className="page-wrapper d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
    <Container className="text-center">
      <h1 style={{ fontSize: '8rem', fontWeight: 900, lineHeight: 1 }} className="gradient-text">404</h1>
      <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn-primary-custom"><FiHome className="me-2" /> Go Home</Link>
    </Container>
  </div>
);

export default NotFoundPage;
