import React from 'react';
import Navbar from './Navbar';

/**
 * Layout - Main layout component with navbar navigation
 */
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[#f8f6f1] antialiased">
      <Navbar />
      <div className="flex-1 min-h-full">
        {children}
      </div>
    </div>
  );
};

export default Layout;