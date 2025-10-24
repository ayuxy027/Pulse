import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { HomePage, ChatPage } from '../../pages';

/**
 * Layout - Main layout component with sidebar navigation and page routing
 */
const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = (isOpen: boolean) => {
    setSidebarOpen(isOpen);
  };

  return (
    <Router>
      <div className="flex h-screen bg-gray-50 antialiased">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={handleSidebarToggle}
        />

        <div className="flex-1 overflow-hidden relative">
          <Routes>
            <Route path="/" element={<HomePage sidebarOpen={sidebarOpen} />} />
            <Route path="/scanner" element={<div className="p-8"><h1 className="text-2xl font-bold">Food Scanner</h1><p>Coming soon...</p></div>} />
            <Route path="/diet" element={<div className="p-8"><h1 className="text-2xl font-bold">Diet Plan</h1><p>Coming soon...</p></div>} />
            <Route path="/tracker" element={<div className="p-8"><h1 className="text-2xl font-bold">Health Tracker</h1><p>Coming soon...</p></div>} />
            <Route path="/chats" element={<ChatPage sidebarOpen={sidebarOpen} />} />
            <Route path="/profile" element={<div className="p-8"><h1 className="text-2xl font-bold">Profile</h1><p>Coming soon...</p></div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default Layout; 