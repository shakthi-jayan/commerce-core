import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTablePackage from 'react-data-table-component';
const DataTable = DataTablePackage.default || DataTablePackage;
import { FiEdit2, FiTrash2, FiPlus, FiDownload, FiRefreshCw } from 'react-icons/fi';
import { Button, Form, Badge, Spinner, Alert } from 'react-bootstrap';
import adminService from '../../services/adminService';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [toggleCleared, setToggleCleared] = useState(false);
  const [deleting, setDeleting] = useState(null); 
  const navigate = useNavigate();
  const { theme } = useTheme();

  const fetchProducts = useCallback(async (pageToFetch, limitToFetch, searchQuery = search) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminService.getProducts({
        page: pageToFetch,
        limit: limitToFetch,
        search: searchQuery,
      });
      setProducts(data.products || []);
      setTotalRows(data.totalProducts || 0);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load products';
      setError(message);
      toast.error(message);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchProducts(page, perPage, search);
  }, [page, perPage]); 

  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) fetchProducts(1, perPage, search);
      else setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]); 

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setDeleting(id);
    try {
      await adminService.deleteProduct(id);
      toast.success('Product deleted successfully');
      fetchProducts(page, perPage);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
    setDeleting(null);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedRows.length} selected products permanently?`)) return;
    try {
      const ids = selectedRows.map((r) => r._id);
      await adminService.bulkDeleteProducts(ids);
      toast.success(`${ids.length} products deleted`);
      setSelectedRows([]);
      setToggleCleared((prev) => !prev);
      fetchProducts(page, perPage);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk delete failed');
    }
  };

  const handleExport = async () => {
    try {
      const response = await adminService.exportProducts();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Products exported');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const columns = [
    {
      name: 'Image',
      selector: (row) => row.images?.[0]?.url,
      cell: (row) => (
        <img
          src={row.images?.[0]?.url || '/placeholder.png'}
          alt={row.name}
          style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
        />
      ),
      width: '80px',
    },
    {
      name: 'Product Name',
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => (
        <div>
          <div className="fw-bold text-truncate" style={{ maxWidth: 200 }} title={row.name}>
            {row.name}
          </div>
          <small className="text-muted">SKU: {row.sku}</small>
        </div>
      ),
    },
    {
      name: 'Category',
      selector: (row) => row.category?.name || '-',
      sortable: true,
    },
    {
      name: 'Price',
      selector: (row) => row.price,
      sortable: true,
      format: (row) => formatPrice(row.price),
    },
    {
      name: 'Stock',
      selector: (row) => row.stock,
      sortable: true,
      cell: (row) => (
        <Badge bg={row.stock > 10 ? 'success' : row.stock > 0 ? 'warning' : 'danger'}>
          {row.stock}
        </Badge>
      ),
    },
    {
      name: 'Status',
      selector: (row) => row.isActive,
      sortable: true,
      cell: (row) => (
        <Badge bg={row.isActive ? 'primary' : 'secondary'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => navigate(`/admin/products/edit/${row._id}`)}
          >
            <FiEdit2 size={14} />
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => handleDelete(row._id)}
            disabled={deleting === row._id}
          >
            {deleting === row._id ? (
              <Spinner size="sm" animation="border" style={{ width: 14, height: 14 }} />
            ) : (
              <FiTrash2 size={14} />
            )}
          </Button>
        </div>
      ),
      width: '120px',
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontWeight: 800, margin: 0 }}>Products</h2>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" onClick={() => fetchProducts(page, perPage)} title="Refresh">
            <FiRefreshCw />
          </Button>
          <Button variant="outline-secondary" onClick={handleExport}>
            <FiDownload className="me-2" /> Export
          </Button>
          <Button variant="primary" as={Link} to="/admin/products/new" className="btn-primary-custom">
            <FiPlus className="me-2" /> Add Product
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}{' '}
          <Button variant="link" className="p-0" onClick={() => fetchProducts(page, perPage)}>
            Retry
          </Button>
        </Alert>
      )}

      <div className="card-custom overflow-hidden">
        {selectedRows.length > 0 && (
          <div
            className="p-3 d-flex align-items-center justify-content-between border-bottom"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
          >
            <span className="fw-bold">{selectedRows.length} items selected</span>
            <Button variant="danger" size="sm" onClick={handleBulkDelete}>
              Delete Selected
            </Button>
          </div>
        )}

        <div className="p-3 border-bottom">
          <Form.Control
            type="text"
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control-custom w-100"
            style={{ maxWidth: 400 }}
          />
        </div>

        <DataTable
          columns={columns}
          data={products}
          progressPending={loading}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          onChangeRowsPerPage={(newPerPage, pg) => {
            setPerPage(newPerPage);
            setPage(pg);
          }}
          onChangePage={(pg) => setPage(pg)}
          selectableRows
          onSelectedRowsChange={({ selectedRows: rows }) => setSelectedRows(rows)}
          clearSelectedRows={toggleCleared}
          theme={theme === 'dark' ? 'dark' : 'default'}
          noDataComponent={
            <div className="text-center py-5 text-muted">
              {search ? 'No products match your search.' : 'No products found. Create one to get started.'}
            </div>
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

export default AdminProducts;
