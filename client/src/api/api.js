import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const baseURL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl.replace(/\/$/, '')}/api`;

const api = axios.create({
    baseURL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

// Auth
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const logoutUser = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');

// User
export const getProfile = () => api.get('/users/profile');
export const updateProfile = (data) => api.put('/users/profile', data);
export const updateLifestyle = (data) => api.put('/users/lifestyle', data);
export const getUserById = (id) => api.get(`/users/${id}`);

// Properties
export const getProperties = (params) => api.get('/properties', { params });
export const getPropertyById = (id) => api.get(`/properties/${id}`);
export const createProperty = (data) => api.post('/properties', data);
export const updateProperty = (id, data) => api.put(`/properties/${id}`, data);
export const deleteProperty = (id) => api.delete(`/properties/${id}`);
export const getOwnerProperties = () => api.get('/properties/owner/my');
export const createRoom = (propertyId, data) => api.post(`/properties/${propertyId}/rooms`, data);

// Rooms
export const getRoomById = (id) => api.get(`/rooms/${id}`);
export const getRoomCompatibility = (id) => api.get(`/rooms/${id}/compatibility`);
export const updateRoom = (id, data) => api.put(`/rooms/${id}`, data);
export const deleteRoom = (id) => api.delete(`/rooms/${id}`);

// Applications
export const applyForRoom = (data) => api.post('/applications', data);
export const getMyApplications = () => api.get('/applications/my');
export const getPropertyApplications = (propertyId) => api.get(`/applications/property/${propertyId}`);
export const approveApplication = (id, data) => api.put(`/applications/${id}/approve`, data);
export const rejectApplication = (id, data) => api.put(`/applications/${id}/reject`, data);
export const withdrawApplication = (id) => api.put(`/applications/${id}/withdraw`);

// Admin
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminUsers = (params) => api.get('/admin/users', { params });
export const verifyAdminUser = (id) => api.put(`/admin/users/${id}/verify`);
export const deactivateAdminUser = (id) => api.put(`/admin/users/${id}/deactivate`);
export const getAdminProperties = (params) => api.get('/admin/properties', { params });
export const verifyAdminProperty = (id, data) => api.put(`/admin/properties/${id}/verify`, data);

export default api;
