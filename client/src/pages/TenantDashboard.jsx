import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyApplications, withdrawApplication } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const STATUS_MAP = { pending: 'badge badge-warning', approved: 'badge badge-success', rejected: 'badge badge-error', withdrawn: 'badge badge-muted' };

const TenantDashboard = () => {
    const { user } = useAuth();
    const qc = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['my-applications'],
        queryFn: getMyApplications,
    });
    const applications = data?.data?.applications || [];

    const withdraw = useMutation({
        mutationFn: withdrawApplication,
        onSuccess: () => { toast.success('Application withdrawn'); qc.invalidateQueries(['my-applications']); },
        onError: () => toast.error('Failed to withdraw'),
    });

    const stats = {
        total: applications.length,
        pending: applications.filter(a => a.status === 'pending').length,
        approved: applications.filter(a => a.status === 'approved').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
    };

    return (
        <div className="page-wrapper">
            <div className="container">
                <div style={{ marginBottom: '2rem' }}>
                    <h2>Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
                    <p>Track your room applications and manage your co-living journey</p>
                </div>

                {/* Quick actions */}
                {!user?.lifestyleCompleted && (
                    <div className="card card-body" style={{ background: 'linear-gradient(135deg,#fff5f5,#fff)', border: '2px solid var(--primary)', marginBottom: '1.5rem' }}>
                        <h4>Complete your lifestyle profile to unlock compatibility scores!</h4>
                        <Link to="/onboarding" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem', display: 'inline-block' }}>Take Lifestyle Quiz 🎯</Link>
                    </div>
                )}

                {/* Stats */}
                <div className="grid-4" style={{ marginBottom: '2rem' }}>
                    {[
                        { label: 'Total Applications', value: stats.total, color: 'var(--dark)', bg: 'var(--border-light)' },
                        { label: 'Pending', value: stats.pending, color: '#92400e', bg: '#fef3c7' },
                        { label: 'Approved', value: stats.approved, color: '#065f46', bg: '#d1fae5' },
                        { label: 'Rejected', value: stats.rejected, color: '#991b1b', bg: '#fee2e2' },
                    ].map(({ label, value, color, bg }) => (
                        <div key={label} className="card card-body" style={{ background: bg, border: 'none', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color }}>{value}</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color }}>{label}</div>
                        </div>
                    ))}
                </div>

                {/* Applications List */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>My Applications</h3>
                    <Link to="/search" className="btn btn-primary btn-sm">Browse More Rooms</Link>
                </div>

                {isLoading ? (
                    <div className="loading-center"><div className="spinner" /></div>
                ) : applications.length === 0 ? (
                    <div className="empty-state card card-body">
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                        <h3>No applications yet</h3>
                        <p>Start browsing rooms and apply for your perfect co-living space</p>
                        <Link to="/search" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Rooms</Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {applications.map(app => (
                            <div key={app._id} className="card card-body" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <h4>{app.property?.name || 'Property'}</h4>
                                        <span className={`badge ${STATUS_MAP[app.status] || 'badge-muted'}`} style={{ textTransform: 'capitalize' }}>{app.status}</span>
                                    </div>
                                    <p style={{ fontSize: '0.83rem', marginBottom: '0.5rem' }}>
                                        Room {app.room?.roomNumber} · {app.room?.type} · ₹{app.room?.rent?.toLocaleString()}/mo
                                    </p>
                                    {app.compatibilityScore != null && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                                            <span style={{ fontWeight: 600 }}>Compatibility:</span>
                                            <span style={{ fontWeight: 800, color: app.compatibilityScore >= 80 ? 'var(--success)' : app.compatibilityScore >= 60 ? 'var(--info)' : app.compatibilityScore >= 40 ? 'var(--warning)' : 'var(--error)' }}>
                                                {app.compatibilityScore}%
                                            </span>
                                        </div>
                                    )}
                                    {app.ownerNote && <p style={{ fontSize: '0.8rem', marginTop: '0.35rem', fontStyle: 'italic' }}>Owner note: {app.ownerNote}</p>}
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
                                    <Link to={`/property/${app.property?._id}`} className="btn btn-ghost btn-sm">View</Link>
                                    {app.status === 'pending' && (
                                        <button className="btn btn-danger btn-sm" onClick={() => withdraw.mutate(app._id)} disabled={withdraw.isPending}>Withdraw</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TenantDashboard;
