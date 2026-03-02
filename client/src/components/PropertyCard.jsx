import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Users, Wifi } from 'lucide-react';

const AMENITY_ICONS = {
    wifi: '📶', ac: '❄️', parking: '🅿️', laundry: '👕',
    kitchen: '🍳', gym: '🏋️', security: '🔒', power_backup: '⚡',
    water_purifier: '💧', tv: '📺', furnished: '🛋️',
};

const PropertyCard = ({ property }) => {
    const { _id, name, address, propertyType, amenities = [] } = property;

    return (
        <div className="card card-hover property-card fade-in">
            <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                    <span className="badge badge-dark">{propertyType}</span>
                </div>
                <h4 className="property-name">{name}</h4>
                <p className="property-location">
                    <MapPin size={14} strokeWidth={2.5} /> {address.city}, {address.state}
                </p>
                <div className="property-amenities">
                    {amenities.slice(0, 4).map((a) => (
                        <span key={a} className="chip chip-sm">{AMENITY_ICONS[a] || '✓'} {a.replace('_', ' ')}</span>
                    ))}
                    {amenities.length > 4 && <span className="chip chip-sm">+{amenities.length - 4}</span>}
                </div>
                <div className="property-footer">
                    <Link to={`/property/${_id}`} className="btn btn-primary btn-sm">View Details</Link>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;
