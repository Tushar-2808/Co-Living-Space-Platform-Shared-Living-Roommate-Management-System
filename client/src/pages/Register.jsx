import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../api/api';
import toast from 'react-hot-toast';
import { AuthPageStyles } from './Login';

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'tenant', phone: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const set = (field, val) => setForm(f => ({ ...f, [field]: val }));
    const handleChange = (e) => set(e.target.name, e.target.value);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
        setLoading(true);
        try {
            const res = await registerUser(form);
            const user = res.data.user;
            login(user);
            toast.success(`Welcome to NestMate, ${user.name.split(' ')[0]}!`);
            if (user.role === 'owner') return navigate('/dashboard/owner');
            if (user.role === 'admin') return navigate('/dashboard/admin');
            navigate('/onboarding');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page page-wrapper">
            <div className="auth-card card fade-in">
                <div className="auth-header">
                    <Link to="/" className="auth-logo">🏠 NestMate</Link>
                    <h2>Create Account</h2>
                    <p>Join thousands of verified residents</p>
                </div>
                <div className="role-toggle" style={{ marginBottom: '1.25rem' }}>
                    <button type="button" className={`role-btn ${form.role === 'tenant' ? 'active' : ''}`} onClick={() => set('role', 'tenant')}>
                        🏠 I'm a Tenant
                    </button>
                    <button type="button" className={`role-btn ${form.role === 'owner' ? 'active' : ''}`} onClick={() => set('role', 'owner')}>
                        🏢 I'm an Owner
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input className="form-control" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Ravi Kumar" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input className="form-control" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-control" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required />
                    </div>
                    <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading} type="submit">
                        {loading ? 'Creating account...' : 'Get Started'}
                    </button>
                </form>
                <p className="auth-footer">Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link></p>
            </div>
            <AuthPageStyles />
        </div>
    );
};

export default Register;
