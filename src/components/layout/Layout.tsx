import React from 'react';
import Navbar from './Navbar';
import { DashboardPage, ChatPage } from '../../pages';
import ScannerPage from '../../pages/ScannerPage';
import LandingPage from '../Landing';

/**
 * Layout - Main layout component with navbar
 */
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Router>
      <div className="min-h-screen w-full bg-[#f8f6f1] antialiased">
        <Navbar />
        <div className="flex-1 min-h-full">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/scanner" element={<ScannerPage />} />
            <Route path="/diet" element={<div className="w-full bg-[#f8f6f1] p-8"><div className="p-[30px]"><h1 className="text-2xl font-bold">Diet Plan</h1><p>Coming soon...</p></div></div>} />
            <Route path="/dairy" element={<div className="w-full bg-[#f8f6f1] p-8"><div className="p-[30px]"><h1 className="text-2xl font-bold">Dairy</h1><p>Coming soon...</p></div></div>} />
            <Route path="/chats" element={<ChatPage />} />
            <Route path="/profile" element={<div className="w-full bg-[#f8f6f1] p-8"><div className="p-[30px]"><h1 className="text-2xl font-bold">Profile</h1><p>Coming soon...</p></div></div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default Layout;