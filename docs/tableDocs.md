# 🗄️ Pulse.ai - Comprehensive Database Architecture & Implementation Guide

## 🌟 Executive Overview

The Pulse.ai database architecture forms the backbone of our intelligent health coaching platform, providing a secure, efficient, and comprehensive data management system for personalized health recommendations. Our schema is meticulously designed to support real-time health analysis, pattern recognition, and personalized AI coaching.

---

## 🏗️ Core Database Architecture

### **Foundation Layer: Authentication & User Management**

#### **1. `users` Table** - Secure Identity Foundation
*The cornerstone of our secure, privacy-first architecture*

**Purpose**: Extends Supabase authentication with custom user profile data

```sql
users (
  id: UUID (PK, references auth.users(id)),
  full_name: TEXT,
  avatar_url: TEXT
)
```

**Key Features**:
- 🛡️ **Secure Foundation**: Direct integration with Supabase authentication
- 🔐 **Privacy-First**: Minimal data stored, maximum security
- 🔄 **Automatic Sync**: Synchronizes with auth.users for consistency

---

### **Profile Layer: Comprehensive Health Foundation**

#### **2. `user_profiles` Table** - Personal Health Constraints
*Your complete health profile for personalized recommendations*

**Purpose**: Stores static user information collected during onboarding, forming the basis for all personalized recommendations

```sql
user_profiles (
  id: UUID (PK, gen_random_uuid()),
  user_id: UUID (FK, references auth.users(id), CASCADE DELETE, UNIQUE),
  full_name: VARCHAR(255) NOT NULL,
  date_of_birth: DATE NOT NULL,
  gender: VARCHAR(50) NOT NULL CHECK (in 'Male','Female','Prefer not to say','Other'),
  diet_type: VARCHAR(50) NOT NULL CHECK (in 'Vegetarian','Non-Vegetarian','Vegan','Jain','Eggetarian'),
  has_food_allergies: BOOLEAN DEFAULT FALSE,
  food_allergies_details: TEXT,
  medical_conditions: TEXT[] DEFAULT '{}',
  medical_conditions_other: TEXT,
  on_regular_medication: BOOLEAN DEFAULT FALSE,
  medication_details: TEXT,
  created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

**Indexes**: 
- `idx_user_profiles_user_id`

**Critical Role**: Serves as the primary constraint enforcement system, ensuring all health recommendations respect dietary preferences, allergies, and medical conditions.

---

### **Metrics Layer: Long-term Health Tracking**

#### **3. `health_metrics` Table** - Dynamic Health Goals
*Your evolving health journey and objectives*

**Purpose**: Stores long-term health metrics and lifestyle information for goal-oriented coaching

```sql
health_metrics (
  id: UUID (PK, gen_random_uuid()),
  user_id: UUID (FK, references auth.users(id), CASCADE DELETE),
  height_cm: INTEGER NOT NULL,
  current_weight_kg: DECIMAL(5,2) NOT NULL,
  goal: VARCHAR(50) NOT NULL CHECK (in 'Weight Loss','Weight Gain','Maintain','Boost Immunity'),
  physical_activity_level: VARCHAR(50) NOT NULL CHECK (in 'Sedentary','Light','Moderate','High'),
  smoking_habits: VARCHAR(50) NOT NULL CHECK (in 'Yes','No','Sometimes'),
  alcohol_consumption: VARCHAR(50) NOT NULL CHECK (in 'Never','Occasionally','Often'),
  recorded_date: DATE NOT NULL,
  created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

**Indexes**: 
- `idx_health_metrics_user_id`
- `idx_health_metrics_recorded_date` (user_id, recorded_date DESC)

**Key Functions**:
- 📈 **Progress Tracking**: Historical health metrics for trend analysis
- 🎯 **Goal Alignment**: Primary source for personalized health objectives
- 🏃 **Activity Intelligence**: Activity level consideration for recommendations

---

### **Tracking Layer: Real-time Health Monitoring**

#### **4. `daily_tracking` Table** - Current Health Status
*Real-time daily health data for immediate recommendations*

**Purpose**: Captures real-time daily health data for immediate analysis and recommendations

```sql
daily_tracking (
  id: UUID (PK, gen_random_uuid()),
  user_id: UUID (FK, references auth.users(id), CASCADE DELETE),
  tracked_date: DATE NOT NULL,
  breakfast_logged: BOOLEAN DEFAULT FALSE,
  breakfast_time: TIME,
  breakfast_image_url: VARCHAR(500),
  breakfast_notes: TEXT,
  lunch_logged: BOOLEAN DEFAULT FALSE,
  lunch_time: TIME,
  lunch_image_url: VARCHAR(500),
  lunch_notes: TEXT,
  dinner_logged: BOOLEAN DEFAULT FALSE,
  dinner_time: TIME,
  dinner_image_url: VARCHAR(500),
  dinner_notes: TEXT,
  water_glasses: INTEGER DEFAULT 0,
  water_bottles: INTEGER,
  sleep_hours: DECIMAL(3,1) DEFAULT 0,
  sleep_quality: VARCHAR(50) CHECK (in 'Poor','Fair','Good','Excellent'),
  exercise_logged: BOOLEAN DEFAULT FALSE,
  exercise_type: VARCHAR(100) CHECK (in 'Running','Walking','Yoga','Strength Training','Cycling','Sports','Other'),
  exercise_duration_minutes: INTEGER,
  exercise_notes: TEXT,
  symptoms: TEXT[] DEFAULT '{}',
  symptoms_notes: TEXT,
  stress_mood_level: INTEGER CHECK (1-5),
  created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, tracked_date)
)
```

**Indexes**:
- `idx_daily_tracking_user_id`
- `idx_daily_tracking_tracked_date` (user_id, tracked_date DESC)

**Real-time Intelligence**:
- 🍽️ **Meal Tracking**: Complete meal logging with optional image analysis
- 💧 **Hydration Monitoring**: Water intake tracking for health optimization  
- 😴 **Sleep Analysis**: Sleep quality and duration tracking
- 💪 **Exercise Intelligence**: Activity type and duration analysis
- 😟 **Mood & Symptom Tracking**: Stress and symptom monitoring for condition-aware recommendations

---

### **Nutrition Layer: Detailed Intake Analysis**

#### **5. `diet_entries` Table** - Comprehensive Nutrition Data
*Detailed food and water intake for nutritional analysis*

**Purpose**: Tracks detailed food and water intake with nutritional breakdown for comprehensive analysis

```sql
diet_entries (
  id: UUID (PK, gen_random_uuid()),
  user_id: UUID (FK, references auth.users(id), CASCADE DELETE),
  entry_type: TEXT NOT NULL CHECK (in 'water', 'meal'),
  created_at: TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  water_amount: INTEGER,
  meal_type: TEXT CHECK (in 'breakfast', 'lunch', 'snacks', 'dinner'),
  meal_description: TEXT,
  meal_date: DATE,
  meal_time: TIME,
  nutrition: JSONB,
  CONSTRAINT valid_water_entry CHECK (
    (entry_type = 'water' AND water_amount IS NOT NULL AND water_amount > 0)
    OR entry_type != 'water'
  ),
  CONSTRAINT valid_meal_entry CHECK (
    (entry_type = 'meal' AND meal_type IS NOT NULL AND meal_description IS NOT NULL 
     AND meal_date IS NOT NULL AND meal_time IS NOT NULL)
    OR entry_type != 'meal'
  )
)
```

**Advanced Features**:
- 🧪 **Nutritional Intelligence**: JSONB storage for detailed nutritional breakdown
- 💧 **Hydration Tracking**: Separate water intake monitoring
- 📆 **Temporal Analysis**: Time-based meal pattern recognition
- 🍽️ **Meal Classification**: Structured meal type categorization

---

### **Behavior Layer: Habit Formation & Tracking**

#### **6. `habits` Table** - Behavioral Pattern Analysis
*Habit tracking with calorie burn estimation for behavioral coaching*

**Purpose**: Tracks user habits with calorie burn estimation for behavioral pattern analysis

```sql
habits (
  id: UUID (PK, gen_random_uuid()),
  user_id: UUID (FK, references auth.users(id), CASCADE DELETE),
  description: TEXT NOT NULL,
  habit_type: TEXT NOT NULL CHECK (in 'daily', 'weekly', 'monthly'),
  calories_burned: INTEGER,
  is_completed: BOOLEAN DEFAULT FALSE,
  completed_at: TIMESTAMPTZ,
  created_at: TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at: TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
```

**Indexes**:
- `idx_habits_user_id`
- `idx_habits_type`
- `idx_habits_is_completed`
- `idx_habits_user_type` (user_id, habit_type)

**RLS**: Enabled with policies for user-specific access

**Behavioral Intelligence**:
- 📅 **Flexible Scheduling**: Daily, weekly, or monthly habit tracking
- 🔥 **Calorie Awareness**: AI-estimated calorie burn calculation
- 📊 **Completion Analytics**: Habit success rate tracking
- 🎯 **Personalized Patterns**: Behavioral trend analysis for coaching

---

### **Reminder Layer: Proactive Health Management**

#### **7. `reminders` Table** - Scheduled Health Tasks
*One-time reminders for proactive health management*

**Purpose**: Manages one-time reminders with specific dates and times for health tasks

```sql
reminders (
  id: UUID (PK, gen_random_uuid()),
  user_id: UUID (FK, references auth.users(id), CASCADE DELETE),
  description: TEXT NOT NULL,
  reminder_date: DATE NOT NULL,
  reminder_time: TIME NOT NULL,
  is_completed: BOOLEAN DEFAULT FALSE,
  created_at: TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at: TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
```

**Indexes**:
- `idx_reminders_user_id`
- `idx_reminders_date`
- `idx_reminders_is_completed`
- `idx_reminders_user_date` (user_id, reminder_date)

**RLS**: Enabled with policies for user-specific access

**Proactive Features**:
- ⏰ **Time-Based Reminders**: Specific date and time scheduling
- 💊 **Medication Management**: Scheduled medication and supplement reminders
- ✅ **Completion Tracking**: Smart completion status management

---

### **Conversation Layer: AI Interaction History**

#### **8. `recent_chats` Table** - Conversation Intelligence
*Historical conversation data for contextual AI coaching*

**Purpose**: Stores recent chat history for users in the coach component

```sql
recent_chats (
  id: UUID (PK, gen_random_uuid()),
  user_id: UUID (FK, references auth.users(id), CASCADE DELETE),
  chat_id: UUID NOT NULL (gen_random_uuid()), -- Unique identifier for grouping messages in a conversation
  chat_title: TEXT NOT NULL,
  message_content: TEXT NOT NULL,
  sender_type: TEXT NOT NULL CHECK (in 'user', 'coach', 'analyzer'),
  sender_name: TEXT, -- Display name (e.g., "AI Health Coach")
  created_at: TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at: TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
```

**Indexes**:
- `idx_recent_chats_user_id`
- `idx_recent_chats_chat_id`
- `idx_recent_chats_created_at`
- `idx_recent_chats_user_chat` (user_id, chat_id, created_at DESC)

**Triggers**:
- `update_recent_chats_timestamp` (auto-updates updated_at)

**RLS**: Enabled with policies for user-specific access

**AI Enhancement**:
- 💬 **Contextual Memory**: Conversation history for contextual responses
- 🤖 **Dual-Agent Tracking**: Separate tracking for analyzer and coach agent interactions
- 📝 **Rich Metadata**: Detailed message metadata for intelligent analysis

---

## 🚀 Advanced Implementation Strategy

### **1. Image Query & Analysis Feature**

**Database Integration Path**:
- **Trigger**: User uploads meal image via chat interface
- **Analyzer Query**: `user_profiles` (diet restrictions, allergies, medical conditions)
- **Storage**: Results stored in `diet_entries` as 'meal' type with detailed nutrition JSONB
- **AI Enhancement**: Image analysis considers personal constraints in real-time

**Implementation Flow**:
1. 🖼️ User uploads meal image in chat interface
2. 🤖 Analyzer queries user's dietary constraints from `user_profiles`
3. 🧠 AI model analyzes image and generates nutrition breakdown
4. 📊 Results stored in `diet_entries` with full nutritional data
5. 💬 Coach provides personalized recommendations considering constraints

### **2. Intelligent Intake & Diet Management**

**Cross-Table Integration**:
- **Primary Data Sources**: `diet_entries`, `daily_tracking`, `user_profiles`, `health_metrics`
- **Real-time Updates**: Continuous monitoring and adjustment
- **Goal Alignment**: Direct correlation with `health_metrics` objectives

**Smart Processing Chain**:
1. 📊 Analyzer aggregates data from `diet_entries` and `daily_tracking`
2. 🎯 Correlates with user's goals in `health_metrics`
3. ⚠️ Validates against constraints in `user_profiles`
4. 🎣 Coach generates personalized recommendations
5. ✏️ Updates logged in appropriate tables

### **3. Dual-Agent AI System**

**Comprehensive Data Synthesis**:
- **Analyzer Scope**: Reads from all 8 tables for complete user context
- **Real-time Synchronization**: Persistent conversation history maintenance
- **Privacy Assurance**: RLS policies ensure data isolation

**Query Integration Strategy**:
- **Profile Context**: `SELECT * FROM user_profiles WHERE user_id = auth.uid()`
- **Health Trends**: `SELECT * FROM health_metrics WHERE user_id = auth.uid() ORDER BY recorded_date DESC LIMIT 1`
- **Daily Status**: `SELECT * FROM daily_tracking WHERE user_id = auth.uid() AND tracked_date = CURRENT_DATE`
- **Recent Intake**: `SELECT * FROM diet_entries WHERE user_id = auth.uid() AND created_at >= NOW() - INTERVAL '24 hours'`
- **Active Habits**: `SELECT * FROM habits WHERE user_id = auth.uid() AND created_at >= NOW() - INTERVAL '7 days'`
- **Immediate Tasks**: `SELECT * FROM reminders WHERE user_id = auth.uid() AND reminder_date >= CURRENT_DATE`
- **Conversation Memory**: `SELECT * FROM recent_chats WHERE user_id = auth.uid() ORDER BY created_at DESC LIMIT 10`

### **4. Advanced Pattern Recognition & Planning**

**Analytics Foundation**:
- **Historical Analysis**: `diet_entries` for 30-day food pattern identification
- **Symptom Correlation**: `daily_tracking` for health trend analysis
- **Immunity Scoring**: Multi-table calculation using `health_metrics`, `daily_tracking`, `diet_entries`
- **Personalized Planning**: Meal plan generation with `user_profiles` restrictions

### **5. Behavioral Intelligence & Adaptation**

**Adaptive Learning System**:
- **Pattern Analysis**: Historical `daily_tracking` and `diet_entries` correlation
- **Behavioral Insights**: `habits` completion pattern analysis
- **Adaptive Recommendations**: Adjustment based on successful behavior patterns

**Smart Adaptation Examples**:
- 🌅 **Morning Challenges**: If user consistently skips breakfast → suggest grab-and-go options
- 🍕 **Evening Indulgences**: Adjust recommendations based on meal timing preferences
- 🏃 **Exercise Patterns**: Tailor suggestions based on activity completion rates

### **6. Genomic-Informed Recommendations**

**Health-Condition Integration**:
- **Medical Context**: `user_profiles.medical_conditions` for condition-specific nutrition
- **PCOS Intelligence**: Low-GI food suggestions based on `diet_entries` history
- **Thyroid Awareness**: Iodine adjustment based on `user_profiles` medical data
- **Diabetes Management**: Correlation between `daily_tracking` symptoms and `diet_entries` timing

---

## 🔄 Intelligent Data Flow Architecture

### **Complete User Query Processing Flow**

```
1. 🧠 User Query: "Should I eat pizza tonight?"
   ↳ "Analyzer Agent begins comprehensive data gathering"

2. 🕵️ Database Queries Initiated:
   ↳ user_profiles: diet_type, allergies, medical_conditions
   ↵ daily_tracking: today's food logged, current status
   ↵ diet_entries: recent intake, caloric consumption
   ↵ health_metrics: goals, target parameters
   ↵ recent_chats: conversation context

3. 🧩 Data Synthesis & Context Formation:
   ↳ All data structured into actionable health profile
   ↵ Constraints and preferences integrated

4. 🎯 Dual-Agent Processing:
   ↳ Analyzer Agent: formats comprehensive context
   ↵ Coach Agent: generates response with LLM processing

5. 💬 Response Generation:
   ↳ Considers all personal constraints
   ↵ Provides actionable, safe recommendations
   ↵ Maintains transparency in reasoning

6. 📝 Conversation Storage:
   ↳ Interaction stored in recent_chats for context
   ↵ Maintains conversation history
```

### **Intelligent @ Mention System**

**Context-Aware Data Access**:
- `@profile` → `user_profiles` for dietary constraints
- `@health` → `health_metrics` for goals and metrics  
- `@today` → `daily_tracking` for current day status
- `@meals` → `diet_entries` for recent intake analysis
- `@habits` → `habits` for behavioral patterns
- `@reminders` → `reminders` for scheduled tasks
- `@chats` → `recent_chats` for conversation history

---

## 🔐 Security & Privacy Framework

### **Row Level Security (RLS) Implementation**
- All user data tables protected with RLS policies
- Users can only access their own records
- Compliance with health data privacy regulations
- Automatic cascade deletion for data consistency

### **Data Integrity Constraints**
- Comprehensive CHECK constraints for data validation
- Foreign key relationships ensure referential integrity
- Unique constraints prevent duplicate entries
- Timestamps for audit trails and data freshness

---

## 📊 Performance Optimization

### **Critical Index Strategy**
- **User-based Access**: All tables indexed on user_id for efficient queries
- **Temporal Sorting**: Date-based indexes for time-series analysis
- **Frequent Access**: Optimized for analyzer agent query patterns
- **Unique Constraints**: Prevents data duplication while maintaining performance

### **Query Optimization**
- Batched queries minimize database round trips
- Efficient data retrieval patterns for AI processing
- Caching strategies for frequently accessed health profiles
- Asynchronous data loading for responsive user experiences

This comprehensive database architecture ensures that Pulse.ai can deliver highly personalized, contextually-aware health coaching while maintaining the highest standards of security, performance, and scalability.