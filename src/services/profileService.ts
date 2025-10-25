/**
 * Profile Service
 * Handles all database operations for user profiles, health metrics, and daily tracking
 */

import { supabase } from './supabase';
import { StaticProfile, HealthMetrics, DailyTracking } from '../types/profile';

// ============================================
// STATIC PROFILE OPERATIONS
// ============================================

export const profileService = {
  /**
   * Get or create static profile for current user
   */
  async getStaticProfile(userId: string): Promise<StaticProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw error;
      }

      return data as StaticProfile | null;
    } catch (error) {
      console.error('Error fetching static profile:', error);
      return null;
    }
  },

  /**
   * Create or update static profile
   */
  async upsertStaticProfile(
    userId: string,
    profile: Partial<StaticProfile>
  ): Promise<StaticProfile | null> {
    try {
      const now = new Date().toISOString();
      const payload = {
        user_id: userId,
        ...profile,
        updated_at: now,
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      return data as StaticProfile;
    } catch (error) {
      console.error('Error upserting static profile:', error);
      throw error;
    }
  },

  // ============================================
  // HEALTH METRICS OPERATIONS
  // ============================================

  /**
   * Get latest health metrics for user
   */
  async getLatestHealthMetrics(userId: string): Promise<HealthMetrics | null> {
    try {
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data as HealthMetrics | null;
    } catch (error) {
      console.error('Error fetching health metrics:', error);
      return null;
    }
  },

  /**
   * Get health metrics history for user
   */
  async getHealthMetricsHistory(
    userId: string,
    limit: number = 30
  ): Promise<HealthMetrics[]> {
    try {
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_date', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data as HealthMetrics[]) || [];
    } catch (error) {
      console.error('Error fetching health metrics history:', error);
      return [];
    }
  },

  /**
   * Create new health metrics entry
   */
  async createHealthMetrics(
    userId: string,
    metrics: Partial<HealthMetrics>
  ): Promise<HealthMetrics | null> {
    try {
      const now = new Date().toISOString();
      const today = new Date().toISOString().split('T')[0];

      const payload = {
        user_id: userId,
        recorded_date: today,
        ...metrics,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await supabase
        .from('health_metrics')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      return data as HealthMetrics;
    } catch (error) {
      console.error('Error creating health metrics:', error);
      throw error;
    }
  },

  /**
   * Update health metrics
   */
  async updateHealthMetrics(
    metricsId: string,
    updates: Partial<HealthMetrics>
  ): Promise<HealthMetrics | null> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('health_metrics')
        .update({
          ...updates,
          updated_at: now,
        })
        .eq('id', metricsId)
        .select()
        .single();

      if (error) throw error;

      return data as HealthMetrics;
    } catch (error) {
      console.error('Error updating health metrics:', error);
      throw error;
    }
  },

  // ============================================
  // DAILY TRACKING OPERATIONS
  // ============================================

  /**
   * Get today's daily tracking entry
   */
  async getTodayTracking(userId: string): Promise<DailyTracking | null> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('tracked_date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data as DailyTracking | null;
    } catch (error) {
      console.error('Error fetching today tracking:', error);
      return null;
    }
  },

  /**
   * Get daily tracking for specific date
   */
  async getDailyTracking(userId: string, date: string): Promise<DailyTracking | null> {
    try {
      const { data, error } = await supabase
        .from('daily_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('tracked_date', date)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data as DailyTracking | null;
    } catch (error) {
      console.error('Error fetching daily tracking:', error);
      return null;
    }
  },

  /**
   * Get daily tracking history
   */
  async getDailyTrackingHistory(
    userId: string,
    days: number = 30
  ): Promise<DailyTracking[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_tracking')
        .select('*')
        .eq('user_id', userId)
        .gte('tracked_date', startDateStr)
        .order('tracked_date', { ascending: false });

      if (error) throw error;

      return (data as DailyTracking[]) || [];
    } catch (error) {
      console.error('Error fetching daily tracking history:', error);
      return [];
    }
  },

  /**
   * Create or update daily tracking entry
   */
  async upsertDailyTracking(
    userId: string,
    tracking: Partial<DailyTracking>
  ): Promise<DailyTracking | null> {
    try {
      const now = new Date().toISOString();
      const today = new Date().toISOString().split('T')[0];

      const { data: existingData } = await supabase
        .from('daily_tracking')
        .select('id')
        .eq('user_id', userId)
        .eq('tracked_date', today)
        .single();

      let result;

      if (existingData) {
        // Update existing entry
        const { data, error } = await supabase
          .from('daily_tracking')
          .update({
            ...tracking,
            updated_at: now,
          })
          .eq('id', existingData.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new entry
        const { data, error } = await supabase
          .from('daily_tracking')
          .insert({
            user_id: userId,
            tracked_date: today,
            ...tracking,
            created_at: now,
            updated_at: now,
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return result as DailyTracking;
    } catch (error) {
      console.error('Error upserting daily tracking:', error);
      throw error;
    }
  },

  /**
   * Upload meal image to Supabase storage
   */
  async uploadMealImage(
    userId: string,
    file: File,
    mealType: 'breakfast' | 'lunch' | 'dinner'
  ): Promise<string | null> {
    try {
      const fileName = `${userId}/${mealType}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from('meal-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('meal-images')
        .getPublicUrl(fileName);

      return urlData?.publicUrl || null;
    } catch (error) {
      console.error('Error uploading meal image:', error);
      return null;
    }
  },

  /**
   * Delete meal image from storage
   */
  async deleteMealImage(imageUrl: string): Promise<boolean> {
    try {
      // Extract file path from public URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts.slice(-2).join('/');

      const { error } = await supabase.storage
        .from('meal-images')
        .remove([fileName]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting meal image:', error);
      return false;
    }
  },
};
