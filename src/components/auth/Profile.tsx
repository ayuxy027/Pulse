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
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center space-y-4">
          <Avatar
            src={session.user.user_metadata.avatar_url}
            alt="User Avatar"
            className="w-24 h-24"
          />
          <h1 className="text-2xl font-bold">{session.user.user_metadata.full_name}</h1>
          <p className="text-gray-500">{session.user.email}</p>
        </div>
        <Button onClick={signOut} className="w-full">
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Profile;
