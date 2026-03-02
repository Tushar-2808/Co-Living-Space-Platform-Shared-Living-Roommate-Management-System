import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProperties } from '../api/api';
import PropertyCard from '../components/PropertyCard';
import '../components/components.css';
import { useAuth } from '../context/AuthContext';

const AMENITIES = ['wifi', 'ac', 'parking', 'laundry', 'kitchen', 'gym', 'security', 'power_backup'];
const CITIES = ['Mumbai', 'Bangalore', 'Hyderabad', 'Pune', 'Delhi', 'Chennai', 'Kolkata'];

const Home = () => {
    const { user } = useAuth();
    const { data, isLoading } = useQuery({
        queryKey: ['featured-properties'],
        queryFn: () => getProperties({ limit: 6, page: 1 }),
    });
    const featured = data?.data?.properties || [];

    return (
        <div className="home">
            {/* ── Hero ─────────────────────────────────────────── */}
            <section className="hero">
                <div className="hero-bg" />
                <div className="container hero-content">
                    <div className="hero-badge">🏠 Trusted Co-Living Platform</div>
                    <h1>Find Your Perfect<br /><span className="hero-highlight">Co-Living Space</span></h1>
                    <p className="hero-sub">Discover verified shared rooms, match with compatible roommates, and move in with confidence. Built for students &amp; working professionals.</p>
                    <div className="hero-actions">
                        <Link to="/search" className="btn btn-primary btn-lg">Browse Rooms</Link>
                        <Link to="/register" className="btn btn-secondary btn-lg">List Your Property</Link>
                    </div>
                    <div className="hero-stats">
                        <div className="stat"><strong>5,000+</strong><span>Verified Listings</span></div>
                        <div className="stat"><strong>50+</strong><span>Cities</span></div>
                        <div className="stat"><strong>98%</strong><span>Happy Residents</span></div>
                    </div>
                </div>
            </section>

            {/* ── Cities ────────────────────────────────────────── */}
            <section className="section cities-section">
                <div className="container">
                    <h2 className="section-title">Explore by City</h2>
                    <p className="section-sub">Find shared accommodations in India's top cities</p>
                    <div className="cities-grid">
                        {CITIES.map((city) => (
                            <Link key={city} to={`/search?city=${city}`} className="city-card card card-hover">
                                <div className="city-emoji">🏙️</div>
                                <strong>{city}</strong>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Featured Listings ─────────────────────────────── */}
            <section className="section featured-section">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">Featured Listings</h2>
                            <p className="section-sub">Hand-picked verified properties</p>
                        </div>
                        <Link to="/search" className="btn btn-secondary">View All →</Link>
                    </div>
                    {featured.length > 0 ? (
                        <div className="grid-3">
                            {featured.map((p) => <PropertyCard key={p._id} property={p} />)}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No listings yet — <Link to="/register" style={{ color: 'var(--primary)' }}>be the first to list!</Link></p>
                        </div>
                    )}
                </div>
            </section>

            {/* ── How It Works ──────────────────────────────────── */}
            <section className="section how-section">
                <div className="container">
                    <h2 className="section-title" style={{ textAlign: 'center' }}>How It Works</h2>
                    <p className="section-sub" style={{ textAlign: 'center', marginBottom: '3rem' }}>Get settled in 3 simple steps</p>
                    <div className="grid-3 how-grid">
                        {[
                            { icon: '🔍', step: '01', title: 'Discover', desc: 'Search verified rooms filtered by budget, location, and lifestyle preferences.' },
                            { icon: '🤝', step: '02', title: 'Match', desc: 'Get a compatibility score with existing roommates based on your lifestyle quiz.' },
                            { icon: '🏠', step: '03', title: 'Move In', desc: 'Send a join request, get owner approval, and move into your new home.' },
                        ].map(({ icon, step, title, desc }) => (
                            <div key={step} className="how-card card card-body">
                                <div className="how-step">{step}</div>
                                <div className="how-icon">{icon}</div>
                                <h3>{title}</h3>
                                <p>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ───────────────────────────────────────────── */}
            {!user && (
                <section className="cta-section">
                    <div className="container cta-inner">
                        <h2 style={{ color: '#fff' }}>Ready to find your perfect home?</h2>
                        <p style={{ color: 'rgba(255,255,255,0.8)' }}>Join thousands of verified residents across India</p>
                        <div className="hero-actions" style={{ marginTop: '1.5rem' }}>
                            <Link to="/register" className="btn btn-lg" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 700 }}>Sign Up Free</Link>
                            <Link to="/search" className="btn btn-lg btn-secondary" style={{ border: '2px solid rgba(255,255,255,0.5)', color: '#fff', background: 'transparent' }}>Browse Rooms</Link>
                        </div>
                    </div>
                </section>
            )}

            <style>{`
        .home { overflow-x: hidden; }
        .hero { position: relative; min-height: 92vh; display: flex; align-items: center; overflow: hidden; }
        .hero-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #1A1A2E 0%, #2d0a0a 50%, #1A1A2E 100%); z-index: 0; }
        .hero-bg::after { content:''; position: absolute; inset: 0; background: url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1600&q=80') center/cover no-repeat; opacity: 0.12; }
        .hero-content { position: relative; z-index: 1; color: #fff; max-width: 700px; padding: 6rem 0 4rem; animation: fadeInUp 0.7s ease; }
        .hero-badge { display: inline-block; background: rgba(232,64,64,0.2); border: 1px solid rgba(232,64,64,0.4); color: var(--primary-light); padding: 0.4rem 1rem; border-radius: 999px; font-size: 0.85rem; font-weight: 600; margin-bottom: 1.5rem; }
        .hero h1 { color: #fff; margin-bottom: 1rem; }
        .hero-highlight { color: var(--primary-light); }
        .hero-sub { color: rgba(255,255,255,0.75); font-size: 1.1rem; max-width: 520px; margin-bottom: 2rem; }
        .hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 3rem; }
        .hero-stats { display: flex; gap: 2.5rem; flex-wrap: wrap; }
        .stat { display: flex; flex-direction: column; }
        .stat strong { font-size: 1.5rem; font-weight: 800; color: #fff; }
        .stat span { font-size: 0.8rem; color: rgba(255,255,255,0.6); }
        .section-title { color: var(--dark); margin-bottom: 0.4rem; }
        .section-sub { color: var(--text-muted); margin-bottom: 2rem; }
        .section-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .cities-section { background: var(--surface); }
        .cities-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 1rem; }
        .city-card { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.25rem 0.5rem; gap: 0.5rem; text-align: center; border-radius: var(--radius); }
        .city-card:hover { background: #fff0f0; border-color: var(--primary); }
        .city-emoji { font-size: 1.8rem; }
        .featured-section { background: var(--surface-2); }
        .how-section { background: var(--surface); }
        .how-grid { }
        .how-card { text-align: center; position: relative; }
        .how-step { font-size: 0.75rem; font-weight: 800; color: var(--primary); letter-spacing: 0.1em; margin-bottom: 0.5rem; }
        .how-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .how-card h3 { margin-bottom: 0.5rem; }
        .cta-section { background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%); padding: 5rem 0; }
        .cta-inner { text-align: center; }
        @media(max-width:768px) {
          .cities-grid { grid-template-columns: repeat(3,1fr); }
          .hero-stats { gap: 1.5rem; }
        }
        @media(max-width:480px) { .cities-grid { grid-template-columns: repeat(2,1fr); } }
      `}</style>
        </div>
    );
};

export default Home;
