import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TrainingPlans from './pages/TrainingPlans';
import Clients from './pages/Dashboard/Clients';
import ClientDetail from './pages/Dashboard/ClientDetail';
import Exercises from './pages/Dashboard/Exercises';
import Feedback from './pages/Dashboard/Feedback';
import Analytics from './pages/Dashboard/Analytics';
import Reports from './pages/Dashboard/Reports';
import Settings from './pages/Dashboard/Settings';

// Wrapper for the Login page to handle the redirect properly
const LoginWrapper = () => {
  const navigate = useNavigate();
  return <Login onLogin={() => navigate('/dashboard')} />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginWrapper />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="training" element={<TrainingPlans />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/:id" element={<ClientDetail />} />
          <Route path="exercises" element={<Exercises />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          {/* Mock nested routes below */}
          <Route path="messages" element={<div style={{ padding: '2rem' }}>Messages Placeholder</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
