import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProperties } from '../api/api';
import PropertyCard from '../components/PropertyCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import '../components/components.css';

const CITIES = ['Mumbai', 'Bangalore', 'Hyderabad', 'Pune', 'Delhi', 'Chennai', 'Kolkata', 'Ahmedabad'];
const AMENITIES = ['wifi', 'ac', 'parking', 'laundry', 'kitchen', 'gym', 'security', 'power_backup', 'furnished'];
const TYPES = ['apartment', 'house', 'pg', 'hostel'];
const GENDERS = ['any', 'male', 'female'];

const PropertySearch = () => {
    const [sp] = useSearchParams();
    const [filters, setFilters] = useState({ city: sp.get('city') || '', type: '', gender: '', amenities: [], page: 1 });
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const set = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));
    const toggleAmenity = (a) => setFilters(f => ({
        ...f,
        amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
        page: 1,
    }));
    const clearAll = () => setFilters({ city: '', type: '', gender: '', amenities: [], page: 1 });

    const hasFilters = filters.city || filters.type || filters.gender || filters.amenities.length;

    const { data, isLoading } = useQuery({
        queryKey: ['properties', filters],
        queryFn: () => getProperties({
            ...filters,
            amenities: filters.amenities.join(',') || undefined,
        }),
        keepPreviousData: true,
    });
    const { properties = [], total = 0, pages = 1 } = data?.data || {};

    return (
        <div className="search-page page-wrapper">
            <div className="container">
                {/* ── Search Bar ── */}
                <div className="search-bar card card-body" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '200px' }}>
                        <Search size={18} color="var(--text-muted)" />
                        <input className="form-control" style={{ border: 'none', outline: 'none', boxShadow: 'none', padding: '0' }} placeholder="Search by city (e.g. Mumbai)" value={filters.city} onChange={e => set('city', e.target.value)} />
                    </div>
                    <select className="form-control" style={{ width: 'auto' }} value={filters.type} onChange={e => set('type', e.target.value)}>
                        <option value="">All Types</option>
                        {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select className="form-control" style={{ width: 'auto' }} value={filters.gender} onChange={e => set('gender', e.target.value)}>
                        {GENDERS.map(g => <option key={g} value={g}>{g === 'any' ? 'Any Gender' : g}</option>)}
                    </select>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <SlidersHorizontal size={16} /> Filters {filters.amenities.length > 0 && `(${filters.amenities.length})`}
                    </button>
                    {hasFilters && <button className="btn btn-ghost btn-sm" onClick={clearAll}><X size={14} /> Clear</button>}
                </div>

                {/* ── Amenity Filters ── */}
                {sidebarOpen && (
                    <div className="card card-body" style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ marginBottom: '0.75rem' }}>Filter by Amenities</h4>
                        <div className="chip-grid">
                            {AMENITIES.map(a => (
                                <button key={a} className={`chip ${filters.amenities.includes(a) ? 'selected' : ''}`} onClick={() => toggleAmenity(a)}>
                                    {a.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Results ── */}
                <div className="search-results-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <p style={{ fontWeight: 600, color: isLoading ? 'var(--text-muted)' : 'var(--dark)' }}>
                        {isLoading ? 'Searching...' : `${total} propert${total === 1 ? 'y' : 'ies'} found`}
                    </p>
                </div>

                {isLoading ? (
                    <div className="loading-center"><div className="spinner" /></div>
                ) : properties.length === 0 ? (
                    <div className="empty-state">
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠</div>
                        <h3>No properties found</h3>
                        <p>Try adjusting your filters or search another city</p>
                        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={clearAll}>Clear Filters</button>
                    </div>
                ) : (
                    <div className="grid-3">
                        {properties.map(p => <PropertyCard key={p._id} property={p} />)}
                    </div>
                )}

                {/* ── Pagination ── */}
                {pages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                        <button className="btn btn-ghost btn-sm" disabled={filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>← Prev</button>
                        <span style={{ padding: '0.4rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>{filters.page} / {pages}</span>
                        <button className="btn btn-ghost btn-sm" disabled={filters.page >= pages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next →</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertySearch;
