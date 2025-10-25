import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from './services/supabase';
import LandingPage from './components/Landing';
import CoachPage from './pages/CoachPage';
import DashboardPage from './pages/DashboardPage';
import ScannerPage from './pages/ScannerPage';
import TrackerPage from './pages/TrackerPage';
import PlannerPage from './pages/PlannerPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import { Analytics } from "@vercel/analytics/react"
import ProfilePage from './pages/ProfilePage';
import AuthManager from './components/auth/AuthManager';

/**
 * Main Pulse.ai Interface component
 * 
 * This component renders the complete Pulse.ai interface with:
 * - Layout component with navbar navigation and routing
 * - Page-based routing system with React Router
 * - Analytics integration
 */
const PulseaiInterface: React.FC = () => {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <AuthManager />
      <Router>
        <Layout>
          <Analytics />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<LandingPage />} />

            {/* Redirect old routes to new routes */}
            <Route path="/chat" element={<Navigate to="/coach" replace />} />
            <Route path="/chats" element={<Navigate to="/coach" replace />} />
            <Route path="/diet" element={<Navigate to="/tracker" replace />} />
            <Route path="/dairy" element={<Navigate to="/planner" replace />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/coach" element={<CoachPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/scanner" element={<ScannerPage />} />
              <Route path="/tracker" element={<TrackerPage />} />
              <Route path="/planner" element={<PlannerPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </SessionContextProvider>
  );
};

export default PulseaiInterface;