import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminStats, getAdminUsers, getAdminProperties, verifyAdminUser, deactivateAdminUser, verifyAdminProperty } from '../api/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const qc = useQueryClient();
    const [tab, setTab] = useState('stats');

    const { data: statsData } = useQuery({ queryKey: ['admin-stats'], queryFn: getAdminStats });
    const stats = statsData?.data?.stats || {};

    const { data: usersData, isLoading: usersLoading } = useQuery({ queryKey: ['admin-users'], queryFn: () => getAdminUsers({ verified: false }), enabled: tab === 'users' });
    const pendingUsers = usersData?.data?.users || [];

    const { data: propsData, isLoading: propsLoading } = useQuery({ queryKey: ['admin-props'], queryFn: () => getAdminProperties({ verified: false }), enabled: tab === 'properties' });
    const pendingProps = propsData?.data?.properties || [];

    const { data: allUsersData } = useQuery({ queryKey: ['admin-all-users'], queryFn: () => getAdminUsers({}), enabled: tab === 'all-users' });
    const allUsers = allUsersData?.data?.users || [];

    const verifyUser = useMutation({ mutationFn: verifyAdminUser, onSuccess: () => { toast.success('User verified'); qc.invalidateQueries(['admin-users']); qc.invalidateQueries(['admin-stats']); } });
    const deactivate = useMutation({ mutationFn: deactivateAdminUser, onSuccess: () => { toast.success('User deactivated'); qc.invalidateQueries(['admin-all-users']); } });
    const verifyProp = useMutation({ mutationFn: ({ id, v }) => verifyAdminProperty(id, { isVerified: v }), onSuccess: () => { toast.success('Property updated'); qc.invalidateQueries(['admin-props']); qc.invalidateQueries(['admin-stats']); } });

    const STAT_CARDS = [
        { label: 'Total Users', value: stats.users, bg: '#dbeafe', color: '#1e40af' },
        { label: 'Verified Users', value: stats.verifiedUsers, bg: '#d1fae5', color: '#065f46' },
        { label: 'Total Properties', value: stats.properties, bg: '#f3e8ff', color: '#6b21a8' },
        { label: 'Verified Props', value: stats.verifiedProps, bg: '#fef3c7', color: '#92400e' },
        { label: 'Total Rooms', value: stats.rooms, bg: '#fff0f0', color: 'var(--primary)' },
        { label: 'Applications', value: stats.applications, bg: 'var(--border-light)', color: 'var(--text)' },
        { label: 'Approved Bookings', value: stats.approvedApps, bg: '#d1fae5', color: '#065f46' },
    ];

    const TABS = [
        { id: 'stats', label: '📊 Stats' },
        { id: 'users', label: '🔍 Verify Users' },
        { id: 'properties', label: '🏢 Verify Properties' },
        { id: 'all-users', label: '👥 All Users' },
    ];

    return (
        <div className="page-wrapper">
            <div className="container">
                <div style={{ marginBottom: '2rem' }}>
                    <h2>Admin Dashboard</h2>
                    <p>Platform overview, verification queue, and user management</p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    {TABS.map(t => (
                        <button key={t.id} className={`btn btn-sm ${tab === t.id ? 'btn-dark' : 'btn-ghost'}`} onClick={() => setTab(t.id)}>{t.label}</button>
                    ))}
                </div>

                {/* ── Stats ── */}
                {tab === 'stats' && (
                    <div className="grid-4">
                        {STAT_CARDS.map(({ label, value, bg, color }) => (
                            <div key={label} className="card card-body" style={{ background: bg, border: 'none', textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color }}>{value ?? '...'}</div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 600, color, marginTop: '0.25rem' }}>{label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Verify Users ── */}
                {tab === 'users' && (
                    <>
                        <h3 style={{ marginBottom: '1rem' }}>Pending User Verification ({pendingUsers.length})</h3>
                        {usersLoading ? <div className="loading-center"><div className="spinner" /></div> :
                            pendingUsers.length === 0 ? <div className="empty-state"><p>🎉 No pending user verifications.</p></div> :
                                pendingUsers.map(u => (
                                    <div key={u._id} className="card card-body" style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>{u.name} <span className="badge badge-muted" style={{ textTransform: 'capitalize' }}>{u.role}</span></div>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{u.email} · {u.phone || 'No phone'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Joined {new Date(u.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn btn-success btn-sm" onClick={() => verifyUser.mutate(u._id)}>✓ Verify</button>
                                        </div>
                                    </div>
                                ))}
                    </>
                )}

                {/* ── Verify Properties ── */}
                {tab === 'properties' && (
                    <>
                        <h3 style={{ marginBottom: '1rem' }}>Pending Property Verification ({pendingProps.length})</h3>
                        {propsLoading ? <div className="loading-center"><div className="spinner" /></div> :
                            pendingProps.length === 0 ? <div className="empty-state"><p>🎉 All properties are verified.</p></div> :
                                pendingProps.map(p => (
                                    <div key={p._id} className="card card-body" style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>{p.name} <span className="badge badge-muted" style={{ textTransform: 'capitalize' }}>{p.propertyType}</span></div>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{p.address.city}, {p.address.state}</div>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Owner: {p.owner?.name} ({p.owner?.email})</div>
                                            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>{p.description?.slice(0, 100)}...</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn btn-success btn-sm" onClick={() => verifyProp.mutate({ id: p._id, v: true })}>✓ Approve</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => verifyProp.mutate({ id: p._id, v: false })}>✗ Reject</button>
                                        </div>
                                    </div>
                                ))}
                    </>
                )}

                {/* ── All Users ── */}
                {tab === 'all-users' && (
                    <>
                        <h3 style={{ marginBottom: '1rem' }}>All Users</h3>
                        {allUsers.length === 0 ? <div className="empty-state"><p>No users found.</p></div> :
                            allUsers.map(u => (
                                <div key={u._id} className="card card-body" style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                            {u.name?.[0]}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{u.name} <span className="badge badge-muted" style={{ textTransform: 'capitalize', fontSize: '0.7rem' }}>{u.role}</span>
                                                {u.isVerified && <span className="badge badge-success" style={{ marginLeft: '0.25rem', fontSize: '0.7rem' }}>✓</span>}
                                                {!u.isActive && <span className="badge badge-error" style={{ marginLeft: '0.25rem', fontSize: '0.7rem' }}>Deactivated</span>}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {!u.isVerified && <button className="btn btn-success btn-sm" onClick={() => verifyUser.mutate(u._id)}>Verify</button>}
                                        {u.isActive && <button className="btn btn-danger btn-sm" onClick={() => deactivate.mutate(u._id)}>Deactivate</button>}
                                    </div>
                                </div>
                            ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
