import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { TourProvider } from '@reactour/tour';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import LandingPage from './pages/LandingPage';
import Layout from './components/Layout';
import { useAuth } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import TrainingPlans from './pages/TrainingPlans';
import Clients from './pages/Dashboard/Clients';
import ClientDetail from './pages/Dashboard/ClientDetail';
import Exercises from './pages/Dashboard/Exercises';
import Feedback from './pages/Dashboard/Feedback';
import Analytics from './pages/Dashboard/Analytics';
import Reports from './pages/Dashboard/Reports';
import Settings from './pages/Dashboard/Settings';
import ObjectivesClient from './pages/Dashboard/ObjectivesClient';
import StaffGym from './pages/Dashboard/StaffGym';
import TurnstileGym from './pages/Dashboard/TurnstileGym';
import FinancialGym from './pages/Dashboard/FinancialGym';

// Wrapper for the Login page
const LoginWrapper = () => {
  return <Login />;
};

// Protects routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <TourProvider steps={[]}
      styles={{
        popover: (base) => ({
          ...base,
          borderRadius: 12,
          backgroundColor: 'var(--bg-card, #ffffff)',
          color: 'var(--text-main, #1a1a1a)',
        }),
        close: (base) => ({ ...base, color: 'var(--primary, #3b82f6)' }),
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginWrapper />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/__/auth/action" element={<ResetPassword />} /> 
          <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="training" element={<TrainingPlans />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            <Route path="exercises" element={<Exercises />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="objectives" element={<ObjectivesClient />} />
            <Route path="staff" element={<StaffGym />} />
            <Route path="turnstile" element={<TurnstileGym />} />
            <Route path="financial" element={<FinancialGym />} />
            {/* Mock nested routes below */}
            <Route path="messages" element={<div style={{ padding: '2rem' }}>Messages Placeholder</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TourProvider>
  );
}

export default App;
