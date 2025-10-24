import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

const Profile = () => {
  const session = useSession();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate('/');
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-[#f8f6f1] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0px_8px_30px_rgba(0,0,0,0.06)] p-6 md:p-8">
        <div className="flex flex-col items-center text-center gap-2">
          <Avatar
            src={session.user.user_metadata.avatar_url}
            alt={session.user.user_metadata.full_name || session.user.email || 'User'}
            size="w-24 h-24"
          />
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            {session.user.user_metadata.full_name || 'Your Profile'}
          </h1>
          <p className="text-sm text-gray-500">{session.user.email}</p>
        </div>

        <div className="mt-6 space-y-3">
          

          <Button onClick={signOut} className="!w-full !h-10 !px-4 text-sm">
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
