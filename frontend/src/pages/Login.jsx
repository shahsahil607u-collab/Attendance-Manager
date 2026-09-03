import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import { getErrorMessage } from '../utils/helpers';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter email and password.'); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="icon-wrapper"><GraduationCap size={32} /></div>
          <h1>AttendanceMS</h1>
          <p className="subtitle">Technical Team Attendance Management System</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input id="email" type="email" className="form-input" placeholder="Enter your email"
              value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input id="password" type={showPassword ? 'text' : 'password'} className="form-input"
                placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)}
                autoComplete="current-password" style={{ paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            {loading ? <><div className="spinner" style={{ borderTopColor: '#fff' }}></div> Signing in...</> : 'Sign In'}
          </button>
        </form>
        <div style={{ marginTop: 24, padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Demo Credentials</div>
          <div>Coordinator: coordinator@techteam.edu / coordinator123</div>
          <div>HOD: hod@techteam.edu / hod123456</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
