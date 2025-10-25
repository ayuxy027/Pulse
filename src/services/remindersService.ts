/**
 * Reminders Service
 * Handles all database operations for reminders
 */

import { supabase } from './supabase';
import { Reminder, CreateReminder } from '../types/habits';

/**
 * Create a new reminder
 */
export async function createReminder(reminder: CreateReminder): Promise<{ success: boolean; data?: Reminder; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const reminderData = {
      user_id: user.id,
      description: reminder.description,
      reminder_date: reminder.reminder_date,
      reminder_time: reminder.reminder_time,
    };

    const { data, error } = await supabase
      .from('reminders')
      .insert(reminderData)
      .select()
      .single();

    if (error) {
      console.error('Error creating reminder:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error creating reminder:', error);
    return { success: false, error: 'Failed to create reminder' };
  }
}

/**
 * Get all reminders for the current user
 */
export async function getUserReminders(): Promise<{ success: boolean; data?: Reminder[]; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_completed', false)
      .order('reminder_date', { ascending: true })
      .order('reminder_time', { ascending: true });

    if (error) {
      console.error('Error fetching reminders:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Unexpected error fetching reminders:', error);
    return { success: false, error: 'Failed to fetch reminders' };
  }
}

/**
 * Complete and delete a reminder (auto-delete when checked)
 */
export async function completeReminder(reminderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete the reminder when completed
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', reminderId);

    if (error) {
      console.error('Error completing reminder:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error completing reminder:', error);
    return { success: false, error: 'Failed to complete reminder' };
  }
}

/**
 * Delete a reminder
 */
export async function deleteReminder(reminderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', reminderId);

    if (error) {
      console.error('Error deleting reminder:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting reminder:', error);
    return { success: false, error: 'Failed to delete reminder' };
  }
}

/**
 * Get reminders for a specific date
 */
export async function getRemindersByDate(date: string): Promise<{ success: boolean; data?: Reminder[]; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .eq('reminder_date', date)
      .eq('is_completed', false)
      .order('reminder_time', { ascending: true });

    if (error) {
      console.error('Error fetching reminders by date:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Unexpected error fetching reminders by date:', error);
    return { success: false, error: 'Failed to fetch reminders' };
  }
}
