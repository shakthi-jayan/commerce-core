import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Form, Button } from 'react-bootstrap';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    const result = await register({ name: form.name, email: form.email, password: form.password });
    if (result.meta?.requestStatus === 'fulfilled') { toast.success('Account created!'); navigate('/'); }
    else toast.error(result.payload || 'Registration failed');
  };

  return (
    <div className="page-wrapper d-flex align-items-center" style={{ minHeight: '100vh' }}>
      <Container style={{ maxWidth: 440 }}>
        <div className="card-custom p-5">
          <div className="text-center mb-4"><h2 style={{ fontWeight: 800 }}>Create account</h2><p style={{ color: 'var(--text-secondary)' }}>Join CodeCommerce today</p></div>
          <Form onSubmit={handleSubmit}>
            {[{ icon: FiUser, key: 'name', type: 'text', ph: 'Full Name' }, { icon: FiMail, key: 'email', type: 'email', ph: 'Email' }, { icon: FiLock, key: 'password', type: 'password', ph: 'Password' }, { icon: FiLock, key: 'confirmPassword', type: 'password', ph: 'Confirm Password' }].map((f) => (
              <Form.Group key={f.key} className="mb-3">
                <div className="position-relative">
                  <f.icon style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <Form.Control className="form-control-custom" type={f.type} placeholder={f.ph} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} required style={{ paddingLeft: 40 }} />
                </div>
              </Form.Group>
            ))}
            <Button type="submit" className="btn-primary-custom w-100" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</Button>
          </Form>
          <p className="text-center mt-4 mb-0" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link></p>
        </div>
      </Container>
    </div>
  );
};

export default RegisterPage;
