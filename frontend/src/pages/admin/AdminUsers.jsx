import { useEffect, useState, useCallback } from 'react';
import DataTablePackage from 'react-data-table-component';
const DataTable = DataTablePackage.default || DataTablePackage;
import { FiDownload, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { Button, Form, Badge, Spinner, Alert } from 'react-bootstrap';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const { theme } = useTheme();

  const fetchUsers = useCallback(async (pageToFetch, limitToFetch) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminService.getUsers({
        page: pageToFetch,
        limit: limitToFetch,
      });
      setUsers(data.users || []);
      setTotalRows(data.totalUsers || 0);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load users';
      setError(message);
      toast.error(message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers(page, perPage);
  }, [page, perPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoleChange = async (id, role) => {
    setUpdatingUserId(id);
    try {
      await adminService.updateUserRole(id, role);
      toast.success(`User role updated to "${role}"`);
      fetchUsers(page, perPage);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Role update failed');
    }
    setUpdatingUserId(null);
  };

  const handleStatusChange = async (id, isActive) => {
    setUpdatingUserId(id);
    try {
      await adminService.updateUserStatus(id, isActive);
      toast.success(isActive ? 'User activated' : 'User deactivated');
      fetchUsers(page, perPage);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    }
    setUpdatingUserId(null);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
    setDeletingUserId(id);
    try {
      await adminService.deleteUser(id);
      toast.success('User deleted successfully');
      fetchUsers(page, perPage);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
    setDeletingUserId(null);
  };

  const handleExportCSV = async () => {
    try {
      const response = await adminService.exportUsers();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Users exported');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const columns = [
    {
      name: 'Name',
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => (
        <div>
          <span className="fw-bold">{row.name}</span>
          {row.role === 'admin' && (
            <Badge bg="primary" className="ms-2" style={{ fontSize: 9 }}>Admin</Badge>
          )}
        </div>
      ),
    },
    {
      name: 'Email',
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: 'Role',
      selector: (row) => row.role,
      sortable: true,
      cell: (row) => (
        <Form.Select
          size="sm"
          value={row.role}
          onChange={(e) => handleRoleChange(row._id, e.target.value)}
          disabled={row.role === 'admin' || updatingUserId === row._id}
          className="form-control-custom"
          style={{ width: 100 }}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </Form.Select>
      ),
    },
    {
      name: 'Status',
      selector: (row) => row.isActive,
      sortable: true,
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          <Form.Check
            type="switch"
            checked={row.isActive !== false}
            onChange={(e) => handleStatusChange(row._id, e.target.checked)}
            disabled={row.role === 'admin' || updatingUserId === row._id}
          />
          <Badge bg={row.isActive !== false ? 'success' : 'secondary'} style={{ fontSize: 10 }}>
            {row.isActive !== false ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      ),
    },
    {
      name: 'Joined Date',
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
          onClick={() => handleDeleteUser(row._id)}
          disabled={row.role === 'admin' || deletingUserId === row._id}
          title="Delete user"
        >
          {deletingUserId === row._id ? (
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
        <h2 style={{ fontWeight: 800, margin: 0 }}>Users</h2>
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => fetchUsers(page, perPage)}
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
          <Button variant="link" className="p-0" onClick={() => fetchUsers(page, perPage)}>
            Retry
          </Button>
        </Alert>
      )}

      <div className="card-custom overflow-hidden">
        <DataTable
          columns={columns}
          data={users}
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
            <div className="text-center py-5 text-muted">No users found.</div>
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

export default AdminUsers;
