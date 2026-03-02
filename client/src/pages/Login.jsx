import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/api';
import toast from 'react-hot-toast';

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login, isTenant, isOwner, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await loginUser(form);
            const user = res.data.user;
            login(user);
            toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
            if (user.role === 'admin') return navigate('/dashboard/admin');
            if (user.role === 'owner') return navigate('/dashboard/owner');
            if (!user.lifestyleCompleted) return navigate('/onboarding');
            navigate('/dashboard/tenant');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page page-wrapper">
            <div className="auth-card card fade-in">
                <div className="auth-header">
                    <Link to="/" className="auth-logo">🏠 NestMate</Link>
                    <h2>Welcome Back</h2>
                    <p>Sign in to your co-living account</p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-control" type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
                    </div>
                    <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading} type="submit">
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                <p className="auth-footer">Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create one</Link></p>
            </div>
            <AuthPageStyles />
        </div>
    );
};

const AuthPageStyles = () => (
    <style>{`
    .auth-page { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg,#fff5f5 0%,#fff 60%,#fef3c7 100%); }
    .auth-card { width: 100%; max-width: 420px; padding: 2.5rem; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); }
    .auth-header { text-align: center; margin-bottom: 2rem; }
    .auth-logo { font-size: 1.4rem; font-weight: 800; color: var(--primary); display: inline-block; margin-bottom: 1rem; }
    .auth-header h2 { color: var(--dark); margin-bottom: 0.25rem; }
    .auth-header p { color: var(--text-muted); font-size: 0.9rem; }
    .auth-form { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 1.5rem; }
    .auth-footer { text-align: center; font-size: 0.875rem; color: var(--text-muted); }
    .role-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem; }
    .role-btn { padding: 0.65rem; border: 2px solid var(--border); border-radius: var(--radius); background: var(--surface); font-size: 0.875rem; font-weight: 600; color: var(--text-muted); transition: all var(--transition); cursor: pointer; }
    .role-btn.active { border-color: var(--primary); background: #fff0f0; color: var(--primary); }
  `}</style>
);

export { AuthPageStyles };
export default Login;
