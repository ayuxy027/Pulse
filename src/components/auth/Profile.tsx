import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Avatar from '../ui/Avatar';
import StaticInfoSection from './profile/StaticInfoSection';
import HealthMetricsSection from './profile/HealthMetricsSection';
import { profileService } from '../../services/profileService';
import { StaticProfile, HealthMetrics } from '../../types/profile';

const Profile = () => {
  const session = useSession();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();

  const [staticProfile, setStaticProfile] = useState<StaticProfile | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!session?.user?.id) return;

    const loadProfileData = async () => {
      try {
        setIsLoading(true);
        setError(undefined);

        // Load all profile data
        const [static_data, health_data] = await Promise.all([
          profileService.getStaticProfile(session.user.id),
          profileService.getLatestHealthMetrics(session.user.id),
        ]);

        setStaticProfile(static_data);
        setHealthMetrics(health_data);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [session?.user?.id]);

  const handleStaticProfileSave = async (data: Partial<StaticProfile>) => {
    try {
      if (!session?.user?.id) return;
      const updated = await profileService.upsertStaticProfile(
        session.user.id,
        data
      );
      setStaticProfile(updated);
    } catch (err) {
      console.error('Error saving static profile:', err);
      throw err;
    }
  };

  const handleHealthMetricsSave = async (data: Partial<HealthMetrics>) => {
    try {
      if (!session?.user?.id) return;

      if (healthMetrics?.id) {
        // Update existing
        const updated = await profileService.updateHealthMetrics(
          healthMetrics.id,
          data
        );
        setHealthMetrics(updated);
      } else {
        // Create new
        const created = await profileService.createHealthMetrics(
          session.user.id,
          data
        );
        setHealthMetrics(created);
      }
    } catch (err) {
      console.error('Error saving health metrics:', err);
      throw err;
    }
  };

  async function signOut() {
    await supabase.auth.signOut();
    navigate('/');
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-[#f8f6f1] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-8">
          <Avatar
            src={session.user.user_metadata.avatar_url}
            alt={session.user.user_metadata.full_name || session.user.email || 'User'}
            size="w-28 h-28"
          />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {session.user.user_metadata.full_name || 'Your Profile'}
            </h1>
            <p className="text-base text-gray-500 mt-1">{session.user.email}</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              <p className="text-gray-600">Loading your profile...</p>
            </div>
          </div>
        )}

        {!isLoading && (
          <div className="space-y-6 mb-8">
            {/* Section 1: Static Information */}
            <StaticInfoSection
              data={staticProfile || undefined}
              isLoading={isLoading}
              onSave={handleStaticProfileSave}
            />

            {/* Section 2: Health Metrics */}
            <HealthMetricsSection
              data={healthMetrics || undefined}
              isLoading={isLoading}
              onSave={handleHealthMetricsSave}
            />

            {/* Sign Out Button */}
            <button
              onClick={signOut}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
