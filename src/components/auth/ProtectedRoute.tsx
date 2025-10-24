import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';

const ProtectedRoute = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return session ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
