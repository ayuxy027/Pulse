import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { SessionContextProvider } from "@supabase/auth-helpers-react"
import { supabase } from "./services/supabase"
import LandingPage from "./components/Landing"
import ChatPage from "./pages/ChatPage"
import DashboardPage from "./pages/DashboardPage"
import ScannerPage from "./pages/ScannerPage"
import DietPage from "./pages/DietPage"
import DiaryPage from "./pages/Diary"
import LoginPage from "./pages/LoginPage"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import Layout from "./components/layout/Layout"
import { Analytics } from "@vercel/analytics/react"
import ProfilePage from "./pages/ProfilePage"
import AuthManager from "./components/auth/AuthManager"

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
            <Route element={<ProtectedRoute />}>
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/scanner" element={<ScannerPage />} />
              <Route path="/diet" element={<DietPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/chats" element={<ChatPage />} />
              <Route path="/dairy" element={<DiaryPage />} />
            </Route>
          </Routes>
        </Layout>
      </Router>
    </SessionContextProvider>
  )
}

export default PulseaiInterface
