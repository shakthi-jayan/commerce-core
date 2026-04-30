import { Row, Col } from 'react-bootstrap';
import ProductCard from './ProductCard';
import Loader from '../common/Loader';

const ProductList = ({ products, loading }) => {
  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '400px',
      background: '#ffffff',
      borderRadius: '20px',
      border: '1px solid #e2e8f0'
    }}>
      <Loader text="Loading products..." />
    </div>
  );

  if (!products || products.length === 0) {
    return (
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        padding: '60px 40px',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '4rem', 
          marginBottom: '20px',
          opacity: 0.7
        }}>
          🔍
        </div>
        <h4 style={{ 
          color: 'var(--text-primary)', 
          fontWeight: '600',
          marginBottom: '12px',
          fontSize: '1.25rem'
        }}>
          No products found
        </h4>
        <p style={{ 
          color: 'var(--text-secondary)', 
          marginBottom: 0,
          fontSize: '0.9rem'
        }}>
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  return (
    <Row className="g-4 g-lg-5">
      {products.map((product) => (
        <Col 
          key={product._id} 
          xs={12} 
          sm={6} 
          md={6} 
          lg={4}
          xl={4}
          style={{ display: 'flex' }}
        >
          <ProductCard product={product} />
        </Col>
      ))}
    </Row>
  );
};

export default ProductList;