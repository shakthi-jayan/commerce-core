import { useState, useEffect } from 'react';
import { Row, Col, Card, Alert, Spinner, Table } from 'react-bootstrap';
import { FiTrendingUp, FiDollarSign, FiShoppingBag, FiUsers } from 'react-icons/fi';
import adminService from '../../services/adminService';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const AdminReports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load reports data';
      setError(msg);
      toast.error(msg);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3 text-muted">Compiling reports...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" dismissible onClose={() => setError(null)}>
        {error} <Alert.Link onClick={loadReports}>Retry</Alert.Link>
      </Alert>
    );
  }

  // Format monthly revenue for chart
  const monthlyData = stats?.monthlyRevenue?.map(m => ({
    name: m._id,
    revenue: m.revenue,
    orders: m.orders
  })) || [];

  const chartColor = theme === 'dark' ? '#8b83f6' : '#6c63ff';
  const gridColor = theme === 'dark' ? '#2a2d3e' : '#e4e5e9';
  const textColor = theme === 'dark' ? '#a0aabf' : '#6c757d';

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontWeight: 800, margin: 0 }}>Analytics & Reports</h2>
      </div>

      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="card-custom border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center py-4">
              <div className="mb-3 p-3 rounded-circle" style={{ background: 'rgba(108, 99, 255, 0.1)', color: 'var(--primary)' }}>
                <FiDollarSign size={32} />
              </div>
              <h3 className="fw-bold mb-1">{formatPrice(stats?.stats?.totalRevenue || 0)}</h3>
              <span className="text-muted text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: 1 }}>Total Revenue</span>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="card-custom border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center py-4">
              <div className="mb-3 p-3 rounded-circle" style={{ background: 'rgba(40, 167, 69, 0.1)', color: '#28a745' }}>
                <FiShoppingBag size={32} />
              </div>
              <h3 className="fw-bold mb-1">{stats?.stats?.totalOrders || 0}</h3>
              <span className="text-muted text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: 1 }}>Total Orders</span>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="card-custom border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center py-4">
              <div className="mb-3 p-3 rounded-circle" style={{ background: 'rgba(23, 162, 184, 0.1)', color: '#17a2b8' }}>
                <FiUsers size={32} />
              </div>
              <h3 className="fw-bold mb-1">{stats?.stats?.totalUsers || 0}</h3>
              <span className="text-muted text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: 1 }}>Total Customers</span>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="card-custom border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center py-4">
              <div className="mb-3 p-3 rounded-circle" style={{ background: 'rgba(255, 193, 7, 0.1)', color: '#ffc107' }}>
                <FiTrendingUp size={32} />
              </div>
              <h3 className="fw-bold mb-1">{stats?.stats?.totalProducts || 0}</h3>
              <span className="text-muted text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: 1 }}>Active Products</span>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card className="card-custom border-0 shadow-sm p-4 h-100">
            <h5 className="fw-bold mb-4">Revenue Trend (Last 6 Months)</h5>
            {monthlyData.length > 0 ? (
              <div style={{ height: 350, width: '100%' }}>
                <ResponsiveContainer>
                  <LineChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="name" stroke={textColor} tick={{ fill: textColor }} />
                    <YAxis 
                      stroke={textColor} 
                      tick={{ fill: textColor }}
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)', borderRadius: 8 }}
                      formatter={(value) => [`₹${value}`, 'Revenue']}
                    />
                    <Line type="monotone" dataKey="revenue" stroke={chartColor} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center text-muted py-5 mt-5">Not enough data to display trend chart</div>
            )}
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="card-custom border-0 shadow-sm p-4 h-100">
            <h5 className="fw-bold mb-4">Order Status Distribution</h5>
            {stats?.orderStatusDistribution?.length > 0 ? (
              <div style={{ height: 350, width: '100%' }}>
                <ResponsiveContainer>
                  <BarChart data={stats.orderStatusDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                    <XAxis type="number" stroke={textColor} />
                    <YAxis dataKey="_id" type="category" stroke={textColor} width={80} />
                    <Tooltip 
                      cursor={{ fill: theme === 'dark' ? '#2a2d3e' : '#f8f9fa' }}
                      contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)', borderRadius: 8 }}
                    />
                    <Bar dataKey="count" fill={chartColor} radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center text-muted py-5 mt-5">No orders available</div>
            )}
          </Card>
        </Col>
      </Row>

      <Card className="card-custom border-0 shadow-sm p-4">
        <h5 className="fw-bold mb-4">Sales by Category</h5>
        {stats?.topProducts?.length > 0 ? (
          <div className="table-responsive">
            <Table hover variant={theme === 'dark' ? 'dark' : 'light'} className="align-middle mb-0 text-center">
              <thead style={{ borderBottom: '2px solid var(--border)' }}>
                <tr>
                  <th className="text-start">Category Name</th>
                  <th>Products Sold</th>
                  <th>Total Revenue</th>
                </tr>
              </thead>
              <tbody style={{ borderTop: 'none' }}>
                {stats.topProducts.map((cat, idx) => (
                  <tr key={idx}>
                    <td className="text-start fw-medium">{cat._id || 'Uncategorized'}</td>
                    <td>{cat.totalSold}</td>
                    <td className="fw-bold text-success">{formatPrice(cat.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="text-center text-muted py-4">No category sales data available yet</div>
        )}
      </Card>
    </div>
  );
};

export default AdminReports;
