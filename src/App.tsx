import React from 'react';
import Layout from './components/layout/Layout';
import { Analytics } from "@vercel/analytics/react"

/**
 * Main Knowlia Interface component
 * 
 * This component renders the complete Knowlia interface with:
 * - Layout component with navbar navigation and routing
 * - Page-based routing system with React Router
 * - Analytics integration
 */
const KnowliaInterface: React.FC = () => {
  return (
    <>
      <Analytics />
      <Layout />
    </>
  );
};

export default KnowliaInterface;