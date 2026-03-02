import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOwnerProperties, createProperty, createRoom, getPropertyApplications, approveApplication, rejectApplication } from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AMENITIES_LIST = ['wifi', 'ac', 'parking', 'laundry', 'kitchen', 'gym', 'security', 'power_backup', 'water_purifier', 'tv', 'furnished'];
const ROOM_AMENITIES = ['attached_bath', 'balcony', 'wardrobe', 'ac', 'tv', 'fan', 'bed', 'desk'];

const OwnerDashboard = () => {
    const { user } = useAuth();
    const qc = useQueryClient();
    const [tab, setTab] = useState('properties'); // 'properties' | 'applications' | 'add-property' | 'add-room'
    const [selProp, setSelProp] = useState(null);

    // — Property form
    const [pForm, setPForm] = useState({ name: '', description: '', address: { street: '', city: '', state: '', pincode: '' }, propertyType: 'apartment', totalRooms: 1, amenities: [], houseRules: [], genderPreference: 'any' });
    // — Room form
    const [rForm, setRForm] = useState({ roomNumber: '', type: 'shared', rent: '', deposit: '', capacity: 2, amenities: [] });

    const { data: propsData, isLoading: propsLoading } = useQuery({ queryKey: ['owner-properties'], queryFn: getOwnerProperties });
    const properties = propsData?.data?.properties || [];

    const { data: appsData, isLoading: appsLoading } = useQuery({
        queryKey: ['property-apps', selProp?._id],
        queryFn: () => getPropertyApplications(selProp._id),
        enabled: !!selProp,
    });
    const applications = appsData?.data?.applications || [];

    const addPropMutation = useMutation({
        mutationFn: () => createProperty({ ...pForm, totalRooms: Number(pForm.totalRooms) }),
        onSuccess: () => { toast.success('Property listed!'); qc.invalidateQueries(['owner-properties']); setTab('properties'); },
        onError: (e) => toast.error(e?.response?.data?.message || 'Failed to create property'),
    });

    const addRoomMutation = useMutation({
        mutationFn: () => createRoom(selProp._id, { ...rForm, rent: Number(rForm.rent), deposit: Number(rForm.deposit), capacity: Number(rForm.capacity) }),
        onSuccess: () => { toast.success('Room added!'); setTab('properties'); },
        onError: (e) => toast.error(e?.response?.data?.message || 'Failed to add room'),
    });

    const approveMut = useMutation({ mutationFn: (id) => approveApplication(id, {}), onSuccess: () => { toast.success('Approved!'); qc.invalidateQueries(['property-apps']); } });
    const rejectMut = useMutation({ mutationFn: (id) => rejectApplication(id, {}), onSuccess: () => { toast.success('Rejected'); qc.invalidateQueries(['property-apps']); } });

    const toggleAmenity = (list, setList, val) => setList(f => ({ ...f, amenities: f.amenities.includes(val) ? f.amenities.filter(x => x !== val) : [...f.amenities, val] }));

    const TABS = [{ id: 'properties', label: 'My Listings' }, { id: 'applications', label: 'Applications' }, { id: 'add-property', label: '+ Add Property' }];

    return (
        <div className="page-wrapper">
            <div className="container">
                <div style={{ marginBottom: '2rem' }}>
                    <h2>Owner Dashboard</h2>
                    <p>Manage your properties, rooms, and tenant applications</p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    {TABS.map(t => (
                        <button key={t.id} className={`btn ${tab === t.id ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(t.id)}>{t.label}</button>
                    ))}
                </div>

                {/* ── My Listings ── */}
                {tab === 'properties' && (
                    <>
                        {propsLoading ? <div className="loading-center"><div className="spinner" /></div> :
                            properties.length === 0 ? (
                                <div className="empty-state card card-body">
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
                                    <h3>No listings yet</h3>
                                    <p>Add your first property to start receiving applications</p>
                                    <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setTab('add-property')}>Add Property</button>
                                </div>
                            ) : (
                                <div className="grid-3">
                                    {properties.map(p => (
                                        <div key={p._id} className="card card-hover" style={{ cursor: 'default' }}>
                                            <div className="card-body">
                                                <h4 style={{ marginBottom: '0.25rem' }}>{p.name}</h4>
                                                <p style={{ fontSize: '0.82rem', marginBottom: '0.75rem' }}>{p.address.city}, {p.address.state}</p>
                                                <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                                    <span className="badge badge-muted">{p.propertyType}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button className="btn btn-primary btn-sm" onClick={() => { setSelProp(p); setTab('add-room'); }}>+ Room</button>
                                                    <button className="btn btn-ghost btn-sm" onClick={() => { setSelProp(p); setTab('applications'); }}>Applications</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                    </>
                )}

                {/* ── Applications ── */}
                {tab === 'applications' && (
                    <>
                        {!selProp ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <p style={{ marginBottom: '0.5rem' }}>Select a property to view applications:</p>
                                {properties.map(p => (
                                    <button key={p._id} className="card card-body" style={{ textAlign: 'left', cursor: 'pointer', border: '2px solid var(--border)', borderRadius: 'var(--radius)' }} onClick={() => setSelProp(p)}>
                                        <strong>{p.name}</strong> — {p.address.city}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setSelProp(null)}>← Back</button>
                                    <h3>Applications for {selProp.name}</h3>
                                </div>
                                {appsLoading ? <div className="loading-center"><div className="spinner" /></div> :
                                    applications.length === 0 ? <div className="empty-state"><p>No applications yet for this property.</p></div> :
                                        applications.map(app => (
                                            <div key={app._id} className="card card-body" style={{ marginBottom: '1rem' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                                                {app.applicant?.name?.[0]}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 700 }}>{app.applicant?.name}</div>
                                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.applicant?.email}</div>
                                                            </div>
                                                        </div>
                                                        <p style={{ fontSize: '0.82rem', margin: '0.4rem 0' }}>Room {app.room?.roomNumber} · {app.room?.type} · ₹{app.room?.rent?.toLocaleString()}/mo</p>
                                                        {app.compatibilityScore != null && (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
                                                                <span>Compatibility:</span>
                                                                <strong style={{ color: app.compatibilityScore >= 80 ? 'var(--success)' : app.compatibilityScore >= 60 ? 'var(--info)' : app.compatibilityScore >= 40 ? 'var(--warning)' : 'var(--error)' }}>
                                                                    {app.compatibilityScore}%
                                                                </strong>
                                                            </div>
                                                        )}
                                                        {app.message && <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>&ldquo;{app.message}&rdquo;</p>}
                                                        <span className={`badge ${app.status === 'pending' ? 'badge-warning' : app.status === 'approved' ? 'badge-success' : 'badge-error'}`} style={{ marginTop: '0.25rem', textTransform: 'capitalize' }}>{app.status}</span>
                                                    </div>
                                                    {app.status === 'pending' && (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                            <button className="btn btn-success btn-sm" onClick={() => approveMut.mutate(app._id)} disabled={approveMut.isPending}>✓ Approve</button>
                                                            <button className="btn btn-danger btn-sm" onClick={() => rejectMut.mutate(app._id)} disabled={rejectMut.isPending}>✗ Reject</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                }
                            </>
                        )}
                    </>
                )}

                {/* ── Add Property ── */}
                {tab === 'add-property' && (
                    <div style={{ maxWidth: '600px' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>List a New Property</h3>
                        <div className="form-group"><label className="form-label">Property Name</label>
                            <input className="form-control" placeholder="e.g. Sunrise Apartments" value={pForm.name} onChange={e => setPForm({ ...pForm, name: e.target.value })} /></div>
                        <div className="form-group"><label className="form-label">Description</label>
                            <textarea className="form-control" rows={3} placeholder="Describe the property..." value={pForm.description} onChange={e => setPForm({ ...pForm, description: e.target.value })} /></div>
                        <div className="grid-2">
                            <div className="form-group"><label className="form-label">Street</label><input className="form-control" value={pForm.address.street} onChange={e => setPForm({ ...pForm, address: { ...pForm.address, street: e.target.value } })} /></div>
                            <div className="form-group"><label className="form-label">City</label><input className="form-control" value={pForm.address.city} onChange={e => setPForm({ ...pForm, address: { ...pForm.address, city: e.target.value } })} /></div>
                            <div className="form-group"><label className="form-label">State</label><input className="form-control" value={pForm.address.state} onChange={e => setPForm({ ...pForm, address: { ...pForm.address, state: e.target.value } })} /></div>
                            <div className="form-group"><label className="form-label">Pincode</label><input className="form-control" value={pForm.address.pincode} onChange={e => setPForm({ ...pForm, address: { ...pForm.address, pincode: e.target.value } })} /></div>
                        </div>
                        <div className="grid-2">
                            <div className="form-group"><label className="form-label">Property Type</label>
                                <select className="form-control" value={pForm.propertyType} onChange={e => setPForm({ ...pForm, propertyType: e.target.value })}>
                                    {['apartment', 'house', 'pg', 'hostel'].map(t => <option key={t} value={t}>{t}</option>)}
                                </select></div>
                            <div className="form-group"><label className="form-label">Total Rooms</label>
                                <input className="form-control" type="number" min={1} value={pForm.totalRooms} onChange={e => setPForm({ ...pForm, totalRooms: e.target.value })} /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Gender Preference</label>
                            <select className="form-control" value={pForm.genderPreference} onChange={e => setPForm({ ...pForm, genderPreference: e.target.value })}>
                                <option value="any">Any</option><option value="male">Male Only</option><option value="female">Female Only</option>
                            </select></div>
                        <div className="form-group"><label className="form-label">Amenities</label>
                            <div className="chip-grid" style={{ marginTop: '0.5rem' }}>
                                {AMENITIES_LIST.map(a => (
                                    <button key={a} className={`chip ${pForm.amenities.includes(a) ? 'selected' : ''}`} onClick={() => setPForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] }))}>
                                        {a.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button className="btn btn-primary btn-lg" onClick={() => addPropMutation.mutate()} disabled={addPropMutation.isPending}>
                            {addPropMutation.isPending ? 'Creating...' : 'List Property'}
                        </button>
                    </div>
                )}

                {/* ── Add Room ── */}
                {tab === 'add-room' && selProp && (
                    <div style={{ maxWidth: '500px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => setTab('properties')}>← Back</button>
                            <h3>Add Room to {selProp.name}</h3>
                        </div>
                        <div className="grid-2">
                            <div className="form-group"><label className="form-label">Room Number</label><input className="form-control" placeholder="e.g. 101" value={rForm.roomNumber} onChange={e => setRForm({ ...rForm, roomNumber: e.target.value })} /></div>
                            <div className="form-group"><label className="form-label">Type</label>
                                <select className="form-control" value={rForm.type} onChange={e => setRForm({ ...rForm, type: e.target.value })}>
                                    <option value="shared">Shared</option><option value="private">Private</option>
                                </select></div>
                        </div>
                        <div className="grid-2">
                            <div className="form-group"><label className="form-label">Monthly Rent (₹)</label><input className="form-control" type="number" value={rForm.rent} onChange={e => setRForm({ ...rForm, rent: e.target.value })} /></div>
                            <div className="form-group"><label className="form-label">Deposit (₹)</label><input className="form-control" type="number" value={rForm.deposit} onChange={e => setRForm({ ...rForm, deposit: e.target.value })} /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Capacity (persons)</label><input className="form-control" type="number" min={1} value={rForm.capacity} onChange={e => setRForm({ ...rForm, capacity: e.target.value })} /></div>
                        <div className="form-group"><label className="form-label">Room Amenities</label>
                            <div className="chip-grid" style={{ marginTop: '0.5rem' }}>
                                {ROOM_AMENITIES.map(a => (
                                    <button key={a} className={`chip ${rForm.amenities.includes(a) ? 'selected' : ''}`} onClick={() => setRForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] }))}>
                                        {a.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button className="btn btn-primary btn-lg" onClick={() => addRoomMutation.mutate()} disabled={addRoomMutation.isPending}>
                            {addRoomMutation.isPending ? 'Adding...' : 'Add Room'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnerDashboard;
