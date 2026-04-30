import { useEffect, useState, useCallback } from 'react';
import DataTablePackage from 'react-data-table-component';
const DataTable = DataTablePackage.default || DataTablePackage;
import { FiTrash2, FiRefreshCw, FiStar } from 'react-icons/fi';
import { Button, Badge, Spinner, Alert } from 'react-bootstrap';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const { theme } = useTheme();

  const fetchReviews = useCallback(async (pageToFetch, limitToFetch) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminService.getReviews({
        page: pageToFetch,
        limit: limitToFetch,
      });
      setReviews(data.reviews || []);
      setTotalRows(data.totalReviews || 0);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load reviews';
      setError(message);
      toast.error(message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReviews(page, perPage);
  }, [page, perPage, fetchReviews]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;
    setDeletingId(id);
    try {
      await adminService.deleteReview(id);
      toast.success('Review deleted successfully');
      fetchReviews(page, perPage);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    }
    setDeletingId(null);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <FiStar
        key={i}
        size={14}
        fill={i < rating ? '#ffc107' : 'none'}
        color={i < rating ? '#ffc107' : '#e4e5e9'}
      />
    ));
  };

  const columns = [
    {
      name: 'Product',
      selector: (row) => row.product?.name,
      sortable: true,
      cell: (row) => (
        <div className="d-flex align-items-center gap-2 py-2">
          {row.product?.images?.[0]?.url && (
            <img
              src={row.product.images[0].url}
              alt="Product"
              style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
            />
          )}
          <div className="text-truncate" style={{ maxWidth: 150 }} title={row.product?.name || 'Unknown Product'}>
            {row.product?.name || 'Unknown Product'}
          </div>
        </div>
      ),
      width: '220px',
    },
    {
      name: 'Review',
      selector: (row) => row.comment,
      cell: (row) => (
        <div>
          <div className="d-flex align-items-center gap-1 mb-1">
            {renderStars(row.rating)}
          </div>
          <div className="text-truncate text-muted" style={{ maxWidth: 300, fontSize: '0.85rem' }} title={row.comment}>
            {row.comment}
          </div>
        </div>
      ),
      width: '350px',
    },
    {
      name: 'User',
      selector: (row) => row.user?.name,
      sortable: true,
      cell: (row) => (
        <div>
          <div className="fw-bold">{row.user?.name || 'Unknown'}</div>
          <small className="text-muted" style={{ fontSize: '0.75rem' }}>{row.user?.email}</small>
        </div>
      ),
    },
    {
      name: 'Date',
      selector: (row) => row.createdAt,
      sortable: true,
      format: (row) => formatDate(row.createdAt),
    },
    {
      name: 'Actions',
      cell: (row) => (
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => handleDelete(row._id)}
          disabled={deletingId === row._id}
          title="Delete review"
        >
          {deletingId === row._id ? (
            <Spinner size="sm" animation="border" style={{ width: 14, height: 14 }} />
          ) : (
            <FiTrash2 size={14} />
          )}
        </Button>
      ),
      width: '100px',
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontWeight: 800, margin: 0 }}>Customer Reviews</h2>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => fetchReviews(page, perPage)}
          title="Refresh"
        >
          <FiRefreshCw />
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}{' '}
          <Button variant="link" className="p-0" onClick={() => fetchReviews(page, perPage)}>
            Retry
          </Button>
        </Alert>
      )}

      <div className="card-custom overflow-hidden">
        <DataTable
          columns={columns}
          data={reviews}
          progressPending={loading}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          onChangeRowsPerPage={(newPerPage, pg) => {
            setPerPage(newPerPage);
            setPage(pg);
          }}
          onChangePage={(pg) => setPage(pg)}
          theme={theme === 'dark' ? 'dark' : 'default'}
          noDataComponent={
            <div className="text-center py-5 text-muted">No reviews found.</div>
          }
          customStyles={{
            table: { style: { backgroundColor: 'transparent' } },
            headRow: {
              style: { backgroundColor: 'var(--bg-body)', borderBottomColor: 'var(--border)' },
            },
            rows: {
              style: { backgroundColor: 'transparent', borderBottomColor: 'var(--border)' },
            },
            pagination: {
              style: {
                backgroundColor: 'var(--bg-card)',
                borderTopColor: 'var(--border)',
                color: 'var(--text-primary)',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default AdminReviews;
