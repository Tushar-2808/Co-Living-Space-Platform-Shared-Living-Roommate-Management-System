import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../api/api';
import toast from 'react-hot-toast';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isTenant, isOwner, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logoutUser();
            logout();
            toast.success('Logged out successfully');
            navigate('/');
        } catch {
            toast.error('Logout failed');
        }
    };

    const getDashboardLink = () => {
        if (isAdmin) return '/dashboard/admin';
        if (isOwner) return '/dashboard/owner';
        if (isTenant) return '/dashboard/tenant';
        return '/';
    };

    return (
        <nav className="navbar">
            <div className="container navbar-inner">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">🏠</span>
                    <span className="brand-name">NestMate</span>
                    <span className="brand-tag">Co-Living</span>
                </Link>

                <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                    <span /><span /><span />
                </button>

                <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    <NavLink to="/search" className="nav-link" onClick={() => setMenuOpen(false)}>Browse Rooms</NavLink>
                    {!user ? (
                        <>
                            <Link to="/login" className="btn btn-ghost btn-sm" onClick={() => setMenuOpen(false)}>Login</Link>
                            <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Get Started</Link>
                        </>
                    ) : (
                        <>
                            <Link to={getDashboardLink()} className="nav-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                            <div className="nav-user">
                                <div className="nav-avatar">{user.name?.[0]?.toUpperCase()}</div>
                                <span className="nav-name">{user.name?.split(' ')[0]}</span>
                                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
