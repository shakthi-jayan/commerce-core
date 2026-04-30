import { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { FiPackage, FiUsers, FiShoppingBag, FiDollarSign, FiClock, FiAlertTriangle } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import adminService from '../../services/adminService';
import { formatPrice, formatDate } from '../../utils/helpers';
import { ORDER_STATUS_COLORS } from '../../utils/constants';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const CHART_COLORS = ['#6C63FF', '#FF6B6B', '#2ED573', '#FFA502', '#1E90FF', '#A855F7'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getDashboardStats();
      setStats(data);
    } catch (err) {
      toast.error('Failed to load dashboard');
    }
    setLoading(false);
  };

  if (loading || !stats) return <Loader text="Loading dashboard data..." />;

  const statCards = [
    { icon: FiShoppingBag, label: 'Total Products', value: stats.stats.totalProducts, color: '#6C63FF', bg: 'rgba(108,99,255,0.1)' },
    { icon: FiPackage, label: 'Total Orders', value: stats.stats.totalOrders, color: '#FF6B6B', bg: 'rgba(255,107,107,0.1)' },
    { icon: FiUsers, label: 'Total Users', value: stats.stats.totalUsers, color: '#2ED573', bg: 'rgba(46,213,115,0.1)' },
    { icon: FiDollarSign, label: 'Total Revenue', value: formatPrice(stats.stats.totalRevenue), color: '#FFA502', bg: 'rgba(255,165,2,0.1)' },
    { icon: FiClock, label: 'Pending Orders', value: stats.stats.pendingOrders, color: '#1E90FF', bg: 'rgba(30,144,255,0.1)' },
    { icon: FiAlertTriangle, label: 'Low Stock', value: stats.stats.lowStockProducts, color: '#A855F7', bg: 'rgba(168,85,247,0.1)' },
  ];

  return (
    <div>
      <h2 className="mb-4" style={{ fontWeight: 800 }}>Dashboard Overview</h2>
      
      <Row className="g-3 mb-4">
        {statCards.map((s, i) => (
          <Col md={4} lg={4} xl={2} xs={6} key={i}>
            <div className="card-custom p-3 text-center h-100">
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <h4 style={{ fontWeight: 800, marginBottom: 0, fontSize: 'var(--font-size-xl)' }}>{s.value}</h4>
              <small style={{ color: 'var(--text-muted)' }}>{s.label}</small>
            </div>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          <div className="card-custom p-4">
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Monthly Revenue Trend</h6>
            {stats.monthlyRevenue?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="_id" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="revenue" stroke="#6C63FF" strokeWidth={3} dot={{ fill: '#6C63FF', r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-muted text-center py-5">No revenue data available</p>}
          </div>
        </Col>

        <Col lg={4}>
          <div className="card-custom p-4">
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Order Status Distribution</h6>
            {stats.orderStatusDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={stats.orderStatusDistribution} 
                    dataKey="count" 
                    nameKey="_id" 
                    cx="50%" cy="50%" 
                    innerRadius={60}
                    outerRadius={90} 
                    label={({ _id, count }) => `${_id}: ${count}`}
                  >
                    {stats.orderStatusDistribution.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-card)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-muted text-center py-5">No orders yet</p>}
          </div>
        </Col>

        <Col lg={6}>
          <div className="card-custom p-4">
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Top Selling Products</h6>
            {stats.topProducts?.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis dataKey="_id" type="category" width={140} stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Bar dataKey="revenue" fill="#6C63FF" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-muted text-center py-5">No sales data yet</p>}
          </div>
        </Col>

        <Col lg={6}>
          <div className="card-custom p-4">
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Recent Orders</h6>
            {stats.recentOrders?.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 text-nowrap" style={{ color: 'var(--text-primary)' }}>
                  <thead>
                    <tr style={{ color: 'var(--text-muted)' }}>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((o) => (
                      <tr key={o._id}>
                        <td>{o.orderNumber}</td>
                        <td>{o.user?.name || 'Guest'}</td>
                        <td className="fw-bold">{formatPrice(o.totalPrice)}</td>
                        <td>
                          <span className={`badge bg-${ORDER_STATUS_COLORS[o.status]}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-muted text-center py-5">No recent orders</p>}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
