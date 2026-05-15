import { useEffect, useState, useCallback } from 'react';
import DataTablePackage from 'react-data-table-component';
const DataTable = DataTablePackage.default || DataTablePackage;
import { FiDownload, FiXCircle, FiRefreshCw } from 'react-icons/fi';
import { Button, Form, Badge, Spinner, Alert } from 'react-bootstrap';
import adminService from '../../services/adminService';
import { formatPrice, formatDate } from '../../utils/helpers';
import { ORDER_STATUS_COLORS } from '../../utils/constants';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const { theme } = useTheme();

  const fetchOrders = useCallback(async (pageToFetch, limitToFetch, status = statusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminService.getOrders({
        page: pageToFetch,
        limit: limitToFetch,
        status,
      });
      setOrders(data.orders || []);
      setTotalRows(data.totalOrders || 0);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load orders';
      setError(message);
      toast.error(message);
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders(page, perPage, statusFilter);
  }, [page, perPage, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = async (id, status) => {
    setUpdatingOrderId(id);
    try {
      await adminService.updateOrderStatus(id, { status });
      toast.success(`Order status updated to "${status}"`);
      fetchOrders(page, perPage);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    }
    setUpdatingOrderId(null);
  };

  const handleCancelOrder = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) return;
    setCancellingOrderId(id);
    try {
      await adminService.cancelOrder(id);
      toast.success('Order cancelled successfully');
      fetchOrders(page, perPage);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
    setCancellingOrderId(null);
  };

  const handleExportCSV = async () => {
    try {
      const response = await adminService.exportOrders();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Orders exported');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const handleDownloadInvoice = async (id, orderNumber) => {
    try {
      const response = await adminService.generateInvoice(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderNumber}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to generate invoice');
    }
  };

  const columns = [
    {
      name: 'Order Number',
      selector: (row) => row.orderNumber,
      sortable: true,
      cell: (row) => <span className="fw-bold">{row.orderNumber}</span>,
    },
    {
      name: 'Customer',
      selector: (row) => row.user?.name,
      sortable: true,
      cell: (row) => (
        <div>
          <div>{row.user?.name || 'Guest'}</div>
          <small className="text-muted">{row.user?.email}</small>
        </div>
      ),
    },
    {
      name: 'Total',
      selector: (row) => row.totalPrice,
      sortable: true,
      format: (row) => formatPrice(row.totalPrice),
    },
    {
      name: 'Status',
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <Badge bg={ORDER_STATUS_COLORS[row.status] || 'secondary'}>
          {row.status}
        </Badge>
      ),
    },
    {
      name: 'Date',
      selector: (row) => row.createdAt,
      sortable: true,
      format: (row) => formatDate(row.createdAt),
    },
    {
      name: 'Update Status',
      cell: (row) => (
        <div className="d-flex align-items-center gap-1">
          <Form.Select
            size="sm"
            value={row.status}
            onChange={(e) => handleStatusChange(row._id, e.target.value)}
            disabled={row.status === 'cancelled' || updatingOrderId === row._id}
            style={{ width: 130 }}
            className="form-control-custom"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Form.Select>
          {updatingOrderId === row._id && (
            <Spinner size="sm" animation="border" />
          )}
        </div>
      ),
      width: '180px',
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => handleDownloadInvoice(row._id, row.orderNumber)}
            title="Download Invoice"
          >
            <FiDownload size={14} />
          </Button>
          {row.status !== 'cancelled' && row.status !== 'delivered' && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => handleCancelOrder(row._id)}
              disabled={cancellingOrderId === row._id}
              title="Cancel Order"
            >
              {cancellingOrderId === row._id ? (
                <Spinner size="sm" animation="border" style={{ width: 14, height: 14 }} />
              ) : (
                <FiXCircle size={14} />
              )}
            </Button>
          )}
        </div>
      ),
      width: '120px',
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontWeight: 800, margin: 0 }}>Orders</h2>
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => fetchOrders(page, perPage)}
            title="Refresh"
          >
            <FiRefreshCw />
          </Button>
          <Button variant="outline-secondary" onClick={handleExportCSV}>
            <FiDownload className="me-2" /> Export CSV
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}{' '}
          <Button variant="link" className="p-0" onClick={() => fetchOrders(page, perPage)}>
            Retry
          </Button>
        </Alert>
      )}

      <div className="card-custom overflow-hidden">
        <div className="p-3 border-bottom d-flex gap-3">
          <Form.Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="form-control-custom"
            style={{ maxWidth: 200 }}
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </Form.Select>
        </div>

        <DataTable
          columns={columns}
          data={orders}
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
            <div className="text-center py-5 text-muted">
              {statusFilter ? `No ${statusFilter} orders found.` : 'No orders yet.'}
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

export default AdminOrders;
