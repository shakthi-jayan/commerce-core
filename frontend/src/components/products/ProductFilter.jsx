import { Form, Button } from 'react-bootstrap';
import { FiX, FiFilter, FiChevronDown, FiDollarSign, FiStar, FiTag } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import categoryService from '../../services/categoryService';
import { useTheme } from '../../context/ThemeContext';

const ProductFilter = ({ filters, setFilter, resetFilters }) => {
  const [categories, setCategories] = useState([]);
  const { theme } = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    rating: true,
    sort: true
  });

  useEffect(() => {
    categoryService.getCategories().then(({ data }) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const hasActiveFilters = () => {
    return filters.category || filters.minPrice || filters.maxPrice || filters.ratings || (filters.sort && filters.sort !== '-createdAt');
  };

  return (
    <div style={{ 
      background: 'var(--bg-card)', 
      borderRadius: 'var(--radius-xl)', 
      border: '1px solid var(--border)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '20px 24px', 
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <FiFilter size={16} />
          </div>
          <h5 style={{ 
            fontWeight: '700', 
            marginBottom: 0, 
            fontSize: '1rem',
            letterSpacing: '-0.01em',
            color: 'var(--text-primary)'
          }}>
            Filters
          </h5>
        </div>
        <Button 
          variant="link" 
          size="sm" 
          onClick={resetFilters} 
          style={{ 
            color: hasActiveFilters() ? 'var(--primary)' : 'var(--text-muted)',
            textDecoration: 'none', 
            fontSize: '0.75rem',
            fontWeight: '500',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            transition: 'all 0.2s'
          }}
          disabled={!hasActiveFilters()}
        >
          <FiX size={12} className="me-1" /> Clear all
        </Button>
      </div>

      <div style={{ padding: '8px 0' }}>
        {/* Category Section */}
        <div style={{ borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => toggleSection('category')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              color: 'var(--text-primary)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiTag size={14} style={{ color: 'var(--primary)' }} />
              Category
            </span>
            <FiChevronDown size={16} style={{ 
              transform: expandedSections.category ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              color: 'var(--text-secondary)'
            }} />
          </button>
          {expandedSections.category && (
            <div style={{ padding: '0 24px 20px 24px' }}>
              <Form.Group>
                <Form.Select 
                  value={filters.category || ''} 
                  onChange={(e) => setFilter('category', e.target.value || undefined)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: '0.85rem',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          )}
        </div>

        {/* Price Range Section */}
        <div style={{ borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => toggleSection('price')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              color: 'var(--text-primary)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiDollarSign size={14} style={{ color: 'var(--primary)' }} />
              Price Range
            </span>
            <FiChevronDown size={16} style={{ 
              transform: expandedSections.price ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              color: 'var(--text-secondary)'
            }} />
          </button>
          {expandedSections.price && (
            <div style={{ padding: '0 24px 20px 24px' }}>
              <div className="d-flex gap-2">
                <Form.Control 
                  type="number" 
                  placeholder="Min ₹"
                  value={filters.minPrice || ''} 
                  onChange={(e) => setFilter('minPrice', e.target.value || undefined)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: '0.85rem',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)'
                  }}
                />
                <Form.Control 
                  type="number" 
                  placeholder="Max ₹"
                  value={filters.maxPrice || ''} 
                  onChange={(e) => setFilter('maxPrice', e.target.value || undefined)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: '0.85rem',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Rating Section */}
        <div style={{ borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => toggleSection('rating')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              color: 'var(--text-primary)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiStar size={14} style={{ color: 'var(--primary)' }} />
              Customer Rating
            </span>
            <FiChevronDown size={16} style={{ 
              transform: expandedSections.rating ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              color: 'var(--text-secondary)'
            }} />
          </button>
          {expandedSections.rating && (
            <div style={{ padding: '0 24px 20px 24px' }}>
              <Form.Group>
                <Form.Select 
                  value={filters.ratings || ''} 
                  onChange={(e) => setFilter('ratings', e.target.value || undefined)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: '0.85rem',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">All Ratings</option>
                  <option value="4">4★ & above</option>
                  <option value="3">3★ & above</option>
                  <option value="2">2★ & above</option>
                  <option value="1">1★ & above</option>
                </Form.Select>
              </Form.Group>
            </div>
          )}
        </div>

        {/* Sort By Section */}
        <div>
          <button
            onClick={() => toggleSection('sort')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              color: 'var(--text-primary)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiChevronDown size={14} style={{ color: 'var(--primary)', transform: 'rotate(-90deg)' }} />
              Sort By
            </span>
            <FiChevronDown size={16} style={{ 
              transform: expandedSections.sort ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              color: 'var(--text-secondary)'
            }} />
          </button>
          {expandedSections.sort && (
            <div style={{ padding: '0 24px 20px 24px' }}>
              <Form.Group>
                <Form.Select 
                  value={filters.sort || '-createdAt'} 
                  onChange={(e) => setFilter('sort', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: '0.85rem',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="-createdAt">Newest First</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="-ratings">Highest Rated</option>
                  <option value="name">Name: A-Z</option>
                </Form.Select>
              </Form.Group>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters() && (
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-secondary)'
        }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>
            Active Filters:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {filters.category && (
              <span style={{
                background: 'var(--bg-card)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.7rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)'
              }}>
                Category filter
                <FiX size={10} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setFilter('category', undefined)} />
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span style={{
                background: 'var(--bg-card)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.7rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)'
              }}>
                ₹{filters.minPrice || '0'} - ₹{filters.maxPrice || '∞'}
                <FiX size={10} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => {
                  setFilter('minPrice', undefined);
                  setFilter('maxPrice', undefined);
                }} />
              </span>
            )}
            {filters.ratings && (
              <span style={{
                background: 'var(--bg-card)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.7rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)'
              }}>
                {filters.ratings}★ & above
                <FiX size={10} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setFilter('ratings', undefined)} />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilter;