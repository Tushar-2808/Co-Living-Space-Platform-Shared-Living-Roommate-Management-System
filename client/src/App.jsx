import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import LifestyleQuiz from './pages/LifestyleQuiz';
import PropertySearch from './pages/PropertySearch';
import PropertyDetails from './pages/PropertyDetails';
import TenantDashboard from './pages/TenantDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 1000 * 60 * 2, retry: 1 } } });

const App = () => (
  <QueryClientProvider client={qc}>
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<PropertySearch />} />
          <Route path="/property/:id" element={<PropertyDetails />} />

          <Route path="/onboarding" element={
            <ProtectedRoute allowedRoles={['tenant']}><LifestyleQuiz /></ProtectedRoute>
          } />
          <Route path="/dashboard/tenant" element={
            <ProtectedRoute allowedRoles={['tenant']}><TenantDashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard/owner" element={
            <ProtectedRoute allowedRoles={['owner']}><OwnerDashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard/admin" element={
            <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />
        </Routes>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
