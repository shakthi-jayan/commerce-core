import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FiSliders, FiX, FiMoon, FiSun } from 'react-icons/fi';
import { fetchProducts } from '../redux/slices/productSlice';
import ProductList from '../components/products/ProductList';
import ProductFilter from '../components/products/ProductFilter';
import Pagination from '../components/common/Pagination';
import useProductFilter from '../hooks/useProductFilter';
import { useTheme } from '../context/ThemeContext';

const ShopPage = () => {
  const dispatch = useDispatch();
  const { products, loading, currentPage, totalPages, totalResults } = useSelector((s) => s.products);
  const { filters, setFilter, setPage, resetFilters, queryParams } = useProductFilter();
  const { theme, toggleTheme } = useTheme();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const keyword = searchParams.get('keyword');
    if (keyword && keyword !== filters.keyword) setFilter('keyword', keyword);
  }, [searchParams]);

  useEffect(() => {
    dispatch(fetchProducts(queryParams));
  }, [dispatch, queryParams]);

  const hasActiveFilters = () => {
    return filters.category || filters.minPrice || filters.maxPrice || filters.ratings || (filters.sort && filters.sort !== '-createdAt');
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

      {/* Hero Section */}
      <section style={{ 
        background: 'var(--bg-secondary)',
        padding: '60px 0',
        borderBottom: '1px solid var(--border)',
        marginBottom: '48px'
      }}>
        <Container>
          <div>
            <h1 style={{ 
              color: 'var(--text-primary)', 
              fontWeight: '700', 
              fontSize: '2.75rem', 
              letterSpacing: '-0.02em', 
              marginBottom: '16px',
              lineHeight: 1.2
            }}>
              Shop All Products
            </h1>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '1.125rem', 
              marginBottom: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{totalResults.toLocaleString()} products</span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span>Discover our latest collection</span>
            </p>
          </div>
        </Container>
      </section>

      <Container>
        {/* Mobile Filter Toggle */}
        <div className="d-lg-none mb-4">
          <Button 
            variant="outline-secondary"
            onClick={() => {
              const filterPanel = document.getElementById('mobile-filter-panel');
              if (filterPanel) {
                filterPanel.style.display = filterPanel.style.display === 'block' ? 'none' : 'block';
              }
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            <FiSliders size={18} /> Filter Products
            {hasActiveFilters() && (
              <span style={{
                background: 'var(--primary)',
                color: 'white',
                fontSize: '10px',
                padding: '2px 10px',
                borderRadius: 'var(--radius-full)',
                marginLeft: '6px'
              }}>
                Active
              </span>
            )}
          </Button>
        </div>

        <Row className="g-5">
          {/* Desktop Sidebar */}
          <Col lg={4} xl={3} className="d-none d-lg-block">
            <div style={{
              position: 'sticky',
              top: '100px'
            }}>
              <ProductFilter 
                filters={filters} 
                setFilter={setFilter} 
                resetFilters={resetFilters} 
              />
            </div>
          </Col>

          {/* Products Main Area */}
          <Col lg={8} xl={9}>
            {/* Results and Sort Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '28px',
              flexWrap: 'wrap',
              gap: '16px',
              background: 'var(--bg-card)',
              padding: '16px 20px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)'
            }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Showing <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{products?.length || 0}</span> of{' '}
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{totalResults.toLocaleString()}</span> products
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Sort by:</label>
                  <select
                    value={filters.sort || '-createdAt'} 
                    onChange={(e) => setFilter('sort', e.target.value)}
                    style={{
                      padding: '8px 28px 8px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-card)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      outline: 'none',
                      fontWeight: '500',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="-createdAt">Newest First</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                    <option value="-ratings">Highest Rated</option>
                    <option value="name">Name: A-Z</option>
                  </select>
                </div>
              </div>
            </div>

            <ProductList products={products} loading={loading} />
            
            {totalPages > 1 && (
              <div style={{ marginTop: '56px' }}>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </Col>
        </Row>

        {/* Mobile Filter Panel */}
        <div 
          id="mobile-filter-panel" 
          className="d-lg-none" 
          style={{
            display: 'none',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1050,
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              e.currentTarget.style.display = 'none';
            }
          }}
        >
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <div style={{
              padding: '18px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              background: 'var(--bg-card)',
              zIndex: 1
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: 0, color: 'var(--text-primary)' }}>
                Filters
              </h3>
              <button
                onClick={() => {
                  const panel = document.getElementById('mobile-filter-panel');
                  if (panel) panel.style.display = 'none';
                }}
                style={{
                  background: 'var(--bg-secondary)',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  color: 'var(--text-primary)'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <ProductFilter filters={filters} setFilter={setFilter} resetFilters={resetFilters} />
              <Button
                onClick={() => {
                  const panel = document.getElementById('mobile-filter-panel');
                  if (panel) panel.style.display = 'none';
                }}
                style={{
                  width: '100%',
                  marginTop: '24px',
                  background: 'var(--primary)',
                  border: 'none',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ShopPage;