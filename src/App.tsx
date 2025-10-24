import React from 'react';
import Layout from './components/layout/Layout';
import { Analytics } from "@vercel/analytics/react"

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
    <>
      <Analytics />
      <Layout />
    </>
  );
};

export default PulseaiInterface;