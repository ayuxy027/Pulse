import React from 'react';
import Navbar from './Navbar';

/**
 * Layout - Main layout component with navbar
 */
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="h-screen w-screen bg-[#f8f6f1] antialiased overflow-hidden">
      <Navbar />
      <main className="h-[calc(100vh-80px)] w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;