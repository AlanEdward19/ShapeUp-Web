import React from 'react';
import RouteMetadata from './components/RouteMetadata';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TourProvider } from '@reactour/tour';
import './styles/Tour.css';
import { StitchLogin as Login, StitchLanding as LandingPage, StitchRecovery as ForgotPassword } from './stitch/PublicPages';
import Register from './stitch/Registration';

import ResetPassword from './pages/ResetPassword';

import LegalDocument from './pages/LegalDocument';
import NotFound from './pages/NotFound';
import CookieConsent from './components/CookieConsent';
import Layout from './components/Layout';
import { useAuth } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import TrainingPlans from './pages/TrainingPlans';
import Clients from './pages/Dashboard/Clients';
import ClientDetail from './pages/Dashboard/ClientDetail';
import Exercises from './stitch/Exercises';
import Feedback from './stitch/Messages';
import Analytics from './pages/Dashboard/Analytics';
import Reports from './pages/Dashboard/Reports';
import Settings from './stitch/Settings';
import ObjectivesClient from './pages/Dashboard/ObjectivesClient';
import StaffGym from './pages/Dashboard/StaffGym';
import TurnstileGym from './pages/Dashboard/TurnstileGym';
import { StitchFinance as FinancialGym } from './stitch/OperationalPages';
import DiaryDay from './stitch/Nutrition';
import FoodSearch from './pages/Dashboard/Nutrition/FoodSearch';
import MealPlanManager from './pages/Dashboard/Nutrition/MealPlanManager';
import GoalOnboarding from './pages/Dashboard/Nutrition/GoalOnboarding';
import FoodModerationQueue from './stitch/Moderation';
import FeatureFlagsPanel from './pages/Admin/FeatureFlagsPanel';
import Messages from './stitch/Messages';
import ExploreGyms from './stitch/Gyms';
import Onboarding from './stitch/Onboarding';
import useStitchLanguage from './stitch/useStitchLanguage';

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
  useStitchLanguage(document.getElementById('root'));
  return (
    <TourProvider
      steps={[]}
      accentColor="#c45c38"
      styles={{
        popover: (base) => ({
          ...base,
          borderRadius: 12,
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-color)',
        }),
        maskWrapper: (base) => ({
          ...base,
          color: 'oklch(28% 0.02 45 / 0.52)',
        }),
        maskArea: (base) => ({ ...base, rx: 10 }),
        badge: (base) => ({
          ...base,
          backgroundColor: 'var(--primary)',
          background: 'var(--primary)',
          color: 'var(--text-on-primary)',
        }),
        button: (base) => ({
          ...base,
          color: 'var(--primary)',
        }),
        dot: (base, state) => ({
          ...base,
          background: state?.current ? 'var(--primary)' : 'var(--border-color)',
          color: state?.current ? 'var(--primary)' : 'var(--border-color)',
        }),
        close: (base) => ({ ...base, color: 'var(--text-muted)' }),
        arrow: (base) => ({ ...base, color: 'var(--text-main)' }),
      }}
    >
      <BrowserRouter>
        <RouteMetadata />
        <CookieConsent />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy" element={<LegalDocument kind="privacy" />} />
          <Route path="/terms" element={<LegalDocument kind="terms" />} />
          <Route path="/login" element={<LoginWrapper />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/__/auth/action" element={<ResetPassword />} />
          <Route path="/dashboard/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
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
            <Route path="nutrition/diary" element={<DiaryDay />} />
            <Route path="nutrition/foods" element={<FoodSearch />} />
            <Route path="nutrition/meal-plans" element={<MealPlanManager />} />
            <Route path="nutrition/goal" element={<GoalOnboarding />} />
            <Route path="admin/food-moderation" element={<FoodModerationQueue />} />
            <Route path="admin/feature-flags" element={<FeatureFlagsPanel />} />
            <Route path="staff" element={<StaffGym />} />
            <Route path="turnstile" element={<TurnstileGym />} />
            <Route path="financial" element={<FinancialGym />} />
            {/* Mock nested routes below */}
            <Route path="messages" element={<Messages />} />
            <Route path="gyms" element={<ExploreGyms />} />

          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TourProvider>
  );
}

export default App;
