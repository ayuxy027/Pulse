import { useState } from 'react';
import { supabase } from '../../services/supabase';
import Button from '../ui/Button';

const Login = () => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) {
        throw error;
      }
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-full max-w-xs p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Welcome Back
          </h1>
          <p className="mt-2 text-gray-500">
            Sign in to continue.
          </p>
        </div>
        <Button
          onClick={handleLogin}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Loading...' : 'Sign in with Google'}
        </Button>
      </div>
    </div>
  );
};

export default Login;
