import { useState } from 'react';
import { supabase } from '../../services/supabase';
import Button from '../ui/Button';
import logo from '../../assets/logo.png';

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
    <div className="min-h-[calc(100vh-80px)] w-full bg-[#f8f6f1] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-[0px_8px_30px_rgba(0,0,0,0.06)] p-6 md:p-8">
        <div className="flex flex-col items-center text-center gap-2">
          <img src={logo} alt="Pulse" className="w-10 h-10" />
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500">Sign in to continue your journey</p>
        </div>

        <div className="mt-6">
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="!w-full !h-10 !px-4 text-sm"
          >
            {loading ? 'Signing in…' : 'Continue with Google'}
          </Button>

          <p className="mt-3 text-[12px] text-gray-400 text-center">
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
