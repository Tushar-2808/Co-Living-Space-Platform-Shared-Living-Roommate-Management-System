import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getPropertyById, getRoomCompatibility, applyForRoom } from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MapPin, Users, CheckCircle, Star } from 'lucide-react';
import '../components/components.css';

const AMENITY_ICONS = { wifi: '📶', ac: '❄️', parking: '🅿️', laundry: '👕', kitchen: '🍳', gym: '🏋️', security: '🔒', power_backup: '⚡', water_purifier: '💧', tv: '📺', furnished: '🛋️' };

const CompatScore = ({ score }) => {
    const tier = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'low';
    const colors = { excellent: '#10b981', good: '#3b82f6', fair: '#f59e0b', low: '#ef4444' };
    return (
        <div style={{ margin: '0.5rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                <span style={{ color: colors[tier], textTransform: 'capitalize' }}>{tier} Match</span>
                <span style={{ color: colors[tier] }}>{score}%</span>
            </div>
            <div className={`compat-bar compat-${tier}`}><div className="compat-fill" style={{ width: `${score}%` }} /></div>
        </div>
    );
};

const RoomRow = ({ room, userId, isTenant, propertyId }) => {
    const [applying, setApplying] = useState(false);
    const [msg, setMsg] = useState('');
    const [moveIn, setMoveIn] = useState('');

    const { data: compatData } = useQuery({
        queryKey: ['compat', room._id, userId],
        queryFn: () => getRoomCompatibility(room._id),
        enabled: !!userId && isTenant,
        retry: false,
    });
    const compat = compatData?.data;

    const apply = useMutation({
        mutationFn: () => applyForRoom({ roomId: room._id, message: msg, moveInDate: moveIn }),
        onSuccess: () => { toast.success('Application sent!'); setApplying(false); },
        onError: (e) => toast.error(e?.response?.data?.message || 'Failed to apply'),
    });

    const isFull = room.currentOccupancy >= room.capacity;

    return (
        <div className="room-card">
            <div className="room-header">
                <div>
                    <h4>Room {room.roomNumber} <span className="badge badge-muted" style={{ marginLeft: '0.4rem' }}>{room.type}</span></h4>
                    <div className="room-meta">
                        <span className="room-meta-item"><Users size={13} /> {room.currentOccupancy}/{room.capacity} occupied</span>
                        <span className="room-meta-item">📅 Available {room.availableFrom ? new Date(room.availableFrom).toLocaleDateString() : 'Now'}</span>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="room-price">₹{room.rent?.toLocaleString()}<span>/mo</span></div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>₹{room.deposit?.toLocaleString()} deposit</div>
                </div>
            </div>

            {compat && !compat.message && <CompatScore score={compat.score} />}

            {isFull ? (
                <span className="badge badge-error">Room Full</span>
            ) : isTenant && !applying ? (
                <button className="btn btn-primary btn-sm" onClick={() => setApplying(true)}>Apply Now</button>
            ) : applying && (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input className="form-control" placeholder="Move-in date (optional)" type="date" value={moveIn} onChange={e => setMoveIn(e.target.value)} />
                    <textarea className="form-control" placeholder="Message for the owner (optional)" rows={2} value={msg} onChange={e => setMsg(e.target.value)} />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => apply.mutate()} disabled={apply.isPending}>
                            {apply.isPending ? 'Sending...' : 'Confirm Application'}
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setApplying(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const PropertyDetails = () => {
    const { id } = useParams();
    const { user, isTenant } = useAuth();

    const { data, isLoading } = useQuery({
        queryKey: ['property', id],
        queryFn: () => getPropertyById(id),
    });
    const property = data?.data?.property;
    const rooms = data?.data?.rooms || [];

    if (isLoading) return <div className="loading-screen"><div className="spinner" /></div>;
    if (!property) return <div className="page-wrapper container"><p>Property not found.</p></div>;

    const { name, description, address, propertyType, amenities = [], houseRules = [], owner, isVerified, genderPreference } = property;

    return (
        <div className="page-wrapper">
            <div className="container">

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
                    {/* ── Left ── */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                            <h2 style={{ color: 'var(--dark)' }}>{name}</h2>
                            <span className="badge badge-muted" style={{ textTransform: 'capitalize' }}>{propertyType}</span>
                            {genderPreference !== 'any' && <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{genderPreference} only</span>}
                        </div>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            <MapPin size={15} /> {address.street}, {address.city}, {address.state} — {address.pincode}
                        </p>
                        <p style={{ marginBottom: '2rem' }}>{description}</p>

                        {/* Amenities */}
                        <h3 style={{ marginBottom: '0.75rem' }}>Amenities</h3>
                        <div className="chip-grid" style={{ marginBottom: '2rem' }}>
                            {amenities.map(a => <span key={a} className="chip">{AMENITY_ICONS[a] || '✓'} {a.replace('_', ' ')}</span>)}
                        </div>

                        {/* House Rules */}
                        {houseRules.length > 0 && (
                            <>
                                <h3 style={{ marginBottom: '0.75rem' }}>House Rules</h3>
                                <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                                    {houseRules.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                            </>
                        )}

                        {/* Rooms */}
                        <h3 style={{ marginBottom: '1rem' }}>Available Rooms ({rooms.length})</h3>
                        {rooms.length === 0 ? (
                            <p>No rooms listed yet.</p>
                        ) : (
                            rooms.map(r => (
                                <RoomRow key={r._id} room={r} userId={user?._id} isTenant={isTenant} propertyId={id} />
                            ))
                        )}
                    </div>

                    {/* ── Right Sidebar ── */}
                    <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 1.5rem)' }}>
                        <div className="card card-body" style={{ marginBottom: '1rem' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Property Owner</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                                    {owner?.name?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{owner?.name}</div>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.85rem' }}>{owner?.bio || 'Experienced property manager'}</p>
                            {!isTenant && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{owner?.phone}</p>}
                        </div>

                        {!user && (
                            <div className="card card-body" style={{ textAlign: 'center', background: 'linear-gradient(135deg,#fff0f0,#fff)' }}>
                                <p style={{ fontWeight: 600, marginBottom: '1rem' }}>Create an account to apply for rooms and see compatibility scores</p>
                                <Link to="/register" className="btn btn-primary" style={{ width: '100%' }}>Join NestMate</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetails;
