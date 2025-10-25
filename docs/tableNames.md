# 🗃️ Pulse.ai Database Table Reference

## 📋 Core Tables Overview

This document provides a quick reference to the primary database tables used in the Pulse.ai health and nutrition platform.

---

## 🏗️ Table Structure

### **1. `users`**
- **Purpose**: Supabase authentication extension table
- **Role**: Core user identity management
- **Key Columns**: `id` (UUID, PK), `full_name`, `avatar_url`

### **2. `user_profiles`**
- **Purpose**: Static user information collected during onboarding
- **Role**: Personal constraints and health profile storage
- **Key Columns**: Personal details, diet preferences, allergies, medical conditions

### **3. `health_metrics`**
- **Purpose**: Long-term health metrics and lifestyle information
- **Role**: Health goals and physical metrics tracking
- **Key Columns**: Height, weight, health goals, activity levels

### **4. `daily_tracking`**
- **Purpose**: Real-time daily health data tracking
- **Role**: Current day's health activities and metrics
- **Key Columns**: Meal logs, water intake, sleep data, exercise logs, symptoms

### **5. `diet_entries`**
- **Purpose**: Detailed food and water intake tracking
- **Role**: Comprehensive nutrition logging
- **Key Columns**: Meal types, descriptions, nutrition data, timestamps

### **6. `habits`**
- **Purpose**: User habits tracking with calorie burn estimation
- **Role**: Behavioral pattern monitoring
- **Key Columns**: Habit descriptions, types, completion status, calorie burn

### **7. `reminders`**
- **Purpose**: One-time reminders with specific dates/times
- **Role**: Health-related task and medication reminders
- **Key Columns**: Reminder descriptions, dates, times, completion status

### **8. `recent_chats`**
- **Purpose**: Stores recent chat history for the coach component
- **Role**: Conversation history and context storage
- **Key Columns**: Chat titles, message content, sender information, timestamps

---

## 🔄 Data Relationships

The database follows a user-centric model where all tables typically connect to the `users` table via the `user_id` foreign key, enabling comprehensive personalization while maintaining data integrity through proper relationships and constraints.

---

## 🔐 Security & Privacy

All tables implement appropriate Row Level Security (RLS) policies to ensure users can only access their own data, maintaining privacy and compliance with health data regulations.