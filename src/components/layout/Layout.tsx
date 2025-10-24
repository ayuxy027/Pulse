import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { HomePage, ChatPage, CasesPage, InboxPage } from '../../pages';

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
            <Route path="/chats" element={<ChatPage sidebarOpen={sidebarOpen} />} />
            <Route path="/cases" element={<CasesPage sidebarOpen={sidebarOpen} />} />
            <Route path="/inbox" element={<InboxPage sidebarOpen={sidebarOpen} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default Layout; 