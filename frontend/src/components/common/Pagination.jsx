import { Pagination as BSPagination } from 'react-bootstrap';
import { useTheme } from '../../context/ThemeContext';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const { theme } = useTheme();

  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  const start = Math.max(2, currentPage - delta);
  const end = Math.min(totalPages - 1, currentPage + delta);

  pages.push(1);
  if (start > 2) pages.push('...');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push('...');
  if (totalPages > 1) pages.push(totalPages);

  return (
    <div className="d-flex justify-content-center mt-4">
      <BSPagination 
        style={{ 
          '--bs-pagination-color': 'var(--text-primary)',
          '--bs-pagination-bg': 'var(--bg-card)',
          '--bs-pagination-border-color': 'var(--border)',
          '--bs-pagination-hover-color': 'var(--primary)',
          '--bs-pagination-hover-bg': 'var(--primary-50)',
          '--bs-pagination-hover-border-color': 'var(--border)',
          '--bs-pagination-active-bg': 'var(--primary)',
          '--bs-pagination-active-border-color': 'var(--primary)',
          '--bs-pagination-disabled-bg': 'var(--bg-secondary)',
          '--bs-pagination-disabled-border-color': 'var(--border)',
          '--bs-pagination-disabled-color': 'var(--text-muted)'
        }}
      >
        <BSPagination.Prev 
          disabled={currentPage === 1} 
          onClick={() => onPageChange(currentPage - 1)}
        />
        {pages.map((p, i) =>
          p === '...' ? (
            <BSPagination.Ellipsis key={`e-${i}`} disabled />
          ) : (
            <BSPagination.Item 
              key={p} 
              active={p === currentPage} 
              onClick={() => onPageChange(p)}
            >
              {p}
            </BSPagination.Item>
          )
        )}
        <BSPagination.Next 
          disabled={currentPage === totalPages} 
          onClick={() => onPageChange(currentPage + 1)}
        />
      </BSPagination>
    </div>
  );
};

export default Pagination;