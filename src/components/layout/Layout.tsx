import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import { DashboardPage, ChatPage } from '../../pages';
import LandingPage from '../Landing';

/**
 * Layout - Main layout component with navbar navigation and page routing
 */
const Layout: React.FC = () => {
  return (
    <Router>
      <div className="h-[calc(120vh)] w-screen bg-[#f8f6f1] antialiased overflow-hidden">
        <Navbar />
        <div className="flex-1 h-full overflow-hidden">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/scanner" element={<div className="h-full w-full bg-[#f8f6f1] p-8 overflow-hidden"><div className="p-[30px]"><h1 className="text-2xl font-bold">Food Scanner</h1><p>Coming soon...</p></div></div>} />
            <Route path="/diet" element={<div className="h-full w-full bg-[#f8f6f1] p-8 overflow-hidden"><div className="p-[30px]"><h1 className="text-2xl font-bold">Diet Plan</h1><p>Coming soon...</p></div></div>} />
            <Route path="/dairy" element={<div className="h-full w-full bg-[#f8f6f1] p-8 overflow-hidden"><div className="p-[30px]"><h1 className="text-2xl font-bold">Dairy</h1><p>Coming soon...</p></div></div>} />
            <Route path="/chats" element={<ChatPage />} />
            <Route path="/profile" element={<div className="h-full w-full bg-[#f8f6f1] p-8 overflow-hidden"><div className="p-[30px]"><h1 className="text-2xl font-bold">Profile</h1><p>Coming soon...</p></div></div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default Layout; 