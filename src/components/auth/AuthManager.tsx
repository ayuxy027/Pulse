import { useEffect } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

const AuthManager = () => {
  const session = useSession();
  const supabase = useSupabaseClient();

  useEffect(() => {
    const upsertUser = async () => {
      if (session) {
        const { data, error } = await supabase
          .from('users')
          .upsert({
            id: session.user.id,
            full_name: session.user.user_metadata.full_name,
            avatar_url: session.user.user_metadata.avatar_url,
          })
          .select();

        if (error) {
          console.error('Error upserting user:', error);
        }
      }
    };

    upsertUser();
  }, [session, supabase]);

  return null;
};

export default AuthManager;
