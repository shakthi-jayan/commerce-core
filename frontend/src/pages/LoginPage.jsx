import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Form, Button } from 'react-bootstrap';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login({ email, password });
    if (result.meta?.requestStatus === 'fulfilled') { toast.success('Welcome back!'); navigate('/'); }
    else toast.error(result.payload || 'Login failed');
  };

  return (
    <div className="page-wrapper d-flex align-items-center" style={{ minHeight: '100vh' }}>
      <Container style={{ maxWidth: 440 }}>
        <div className="card-custom p-5">
          <div className="text-center mb-4">
            <h2 style={{ fontWeight: 800 }}>Welcome back</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Sign in to your account</p>
          </div>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <div className="position-relative">
                <FiMail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <Form.Control className="form-control-custom" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ paddingLeft: 40 }} />
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <div className="position-relative">
                <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <Form.Control className="form-control-custom" type={showPw ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ paddingLeft: 40, paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>{showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}</button>
              </div>
            </Form.Group>
            <div className="text-end mb-3"><Link to="/forgot-password" style={{ fontSize: 'var(--font-size-sm)' }}>Forgot password?</Link></div>
            <Button type="submit" className="btn-primary-custom w-100" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
          </Form>
          <p className="text-center mt-4 mb-0" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            Don't have an account? <Link to="/register" style={{ fontWeight: 600 }}>Sign up</Link>
          </p>
        </div>
      </Container>
    </div>
  );
};

export default LoginPage;
