import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Container, Form, Button } from 'react-bootstrap';
import { FiShield, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { setUser } from '../redux/slices/authSlice';
import adminService from '../services/adminService';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await adminService.login({ email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      dispatch(setUser(data.user));
      toast.success('Welcome, Admin!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid admin credentials');
    }
    setLoading(false);
  };

  return (
    <div className="page-wrapper d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1A1D2E 0%, #0F1117 100%)' }}>
      <Container style={{ maxWidth: 420 }}>
        <div className="card-custom p-5" style={{ border: '1px solid rgba(108, 99, 255, 0.2)' }}>
          <div className="text-center mb-4">
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FiShield size={28} color="white" />
            </div>
            <h2 style={{ fontWeight: 800, fontSize: 'var(--font-size-2xl)' }}>Admin Panel</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>Enter your admin credentials</p>
          </div>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <div className="position-relative">
                <FiMail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <Form.Control className="form-control-custom" type="email" placeholder="Admin Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ paddingLeft: 40 }} autoComplete="email" />
              </div>
            </Form.Group>
            <Form.Group className="mb-4">
              <div className="position-relative">
                <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <Form.Control className="form-control-custom" type={showPw ? 'text' : 'password'} placeholder="Admin Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ paddingLeft: 40, paddingRight: 40 }} autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </Form.Group>
            <Button type="submit" className="btn-primary-custom w-100" disabled={loading} style={{ padding: '14px' }}>
              {loading ? 'Authenticating...' : 'Access Admin Panel'}
            </Button>
          </Form>
        </div>
      </Container>
    </div>
  );
};

export default AdminLogin;
