# 📊 Pulse.ai-MVP Database Schema & Implementation Guide

## 🏗️ Table Structure Overview

### 1. `users` Table
**Purpose**: Supabase authentication extension table
```sql
users (
  id: UUID (PK, references auth.users(id)),
  full_name: TEXT,
  avatar_url: TEXT
)
```

### 2. `user_profiles` Table
**Purpose**: Static user information (collected during onboarding)
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
Index: idx_user_profiles_user_id
```

### 3. `health_metrics` Table
**Purpose**: Long-term health metrics and lifestyle information
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
Indexes: 
- idx_health_metrics_user_id
- idx_health_metrics_recorded_date (user_id, recorded_date DESC)
```

### 4. `daily_tracking` Table
**Purpose**: Real-time daily health data tracking
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
Indexes:
- idx_daily_tracking_user_id
- idx_daily_tracking_tracked_date (user_id, tracked_date DESC)
```

### 5. `diet_entries` Table
**Purpose**: Detailed food and water intake tracking
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

### 6. `habits` Table
**Purpose**: User habits tracking with calorie burn estimation
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
Indexes:
- idx_habits_user_id
- idx_habits_type
- idx_habits_is_completed
- idx_habits_user_type (user_id, habit_type)
RLS: Enabled with policies for user-specific access
```

### 7. `reminders` Table
**Purpose**: One-time reminders with specific dates/times
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
Indexes:
- idx_reminders_user_id
- idx_reminders_date
- idx_reminders_is_completed
- idx_reminders_user_date (user_id, reminder_date)
RLS: Enabled with policies for user-specific access
```

---

## 🎯 Implementation Strategy for PRD Features

### 1. Image Query of Food Feature
**How it connects to DB**: 
- When user uploads image → Analyzer Agent queries `user_profiles` for diet restrictions, allergies
- Results stored in `diet_entries` table as 'meal' type with nutrition data

**Implementation Steps**:
1. Frontend: User uploads image via chat interface
2. Backend: Image analyzed using AI model
3. Query Supabase: Get user's `user_profiles` (diet_type, allergies, medical_conditions)
4. Store result: Create record in `diet_entries` with nutrition JSONB
5. Return: Analysis to Coach Agent with user's dietary constraints

### 2. Intake & Diet Management
**How it connects to DB**:
- Reads from: `diet_entries`, `daily_tracking`, `user_profiles`, `health_metrics`
- Updates: `diet_entries`, `daily_tracking`

**Implementation Steps**:
1. Analyzer Agent queries:
   - `diet_entries` for daily intake
   - `daily_tracking` for today's water intake
   - `health_metrics` for calorie goals
   - `user_profiles` for restrictions
2. Calculate against user's target from `health_metrics` goal
3. Coach Agent responds with personalized recommendations
4. Log recommendations as needed in `diet_entries`

### 3. Coach System (Dual-Agent Chat)
**How it connects to DB**:
- Analyzer Agent reads from all tables: `user_profiles`, `health_metrics`, `daily_tracking`, `diet_entries`, `habits`, `reminders`
- Stores chat context in Supabase (new chat_history table may be needed)

**Implementation Steps**:
1. When user sends message → Analyzer Agent queries current user data:
   - Profile: `SELECT * FROM user_profiles WHERE user_id = auth.uid()`
   - Health: `SELECT * FROM health_metrics WHERE user_id = auth.uid() ORDER BY recorded_date DESC LIMIT 1`
   - Daily: `SELECT * FROM daily_tracking WHERE user_id = auth.uid() AND tracked_date = CURRENT_DATE`
   - Diet: `SELECT * FROM diet_entries WHERE user_id = auth.uid() AND created_at >= NOW() - INTERVAL '24 hours'`
   - Habits: `SELECT * FROM habits WHERE user_id = auth.uid() AND created_at >= NOW() - INTERVAL '7 days'`
   - Reminders: `SELECT * FROM reminders WHERE user_id = auth.uid() AND reminder_date >= CURRENT_DATE`
2. Format data for Coach Agent
3. Coach Agent generates response considering all context
4. Store conversation in chat history

### 4. Tracker / Dashboard & Diet Planner
**How it connects to DB**:
- Reads from: All tables for comprehensive dashboard view
- Pattern analysis: Uses historical `diet_entries`, `daily_tracking` data

**Implementation Steps**:
1. Query `diet_entries` (last 30 days) to identify food patterns
2. Use `daily_tracking` for trend analysis (symptoms, sleep, stress correlation)
3. Calculate immunity score using data from `health_metrics`, `daily_tracking`, `diet_entries`
4. Generate meal plans using `user_profiles` restrictions + pattern analysis from `diet_entries`

### 5. Behavioral Pattern Adaptation
**How it connects to DB**:
- Analyzes: Historical `daily_tracking`, `diet_entries`, `habits`
- Adapts: Future recommendations based on user behavior patterns

**Implementation Steps**:
1. Query historical `daily_tracking` data for meal timing patterns
2. Analyze `diet_entries` for preferred foods and meal times
3. Track `habits` completion patterns
4. Adjust future recommendations based on successful behaviors
5. For example: If user consistently skips breakfast → suggest grab-and-go options

### 6. Genomic-Informed Recommendations
**How it connects to DB**:
- Uses: `user_profiles` (medical conditions, medications), `health_metrics` (goals), `daily_tracking` (symptoms)

**Implementation Steps**:
1. Use `user_profiles.medical_conditions` to identify condition-specific nutrition needs
2. For PCOS → suggest low-GI foods based on `diet_entries` history
3. For Thyroid → adjust iodine recommendations based on `user_profiles` data
4. For Diabetes → correlate with `daily_tracking` symptoms and `diet_entries` timing
5. Generate immunity-boosting recommendations based on `user_profiles` and symptom patterns in `daily_tracking`

---

## 🔄 Data Flow for Dual Agent System

### User Query Process:
1. **User Input**: "Should I eat pizza tonight?"
2. **Analyzer Agent** queries:
   - `user_profiles` (diet_type, allergies, medical_conditions)
   - `daily_tracking` (today's food logged)
   - `diet_entries` (what user ate today)
   - `health_metrics` (goals)
3. **Analyzer formats** all data in structured context
4. **Coach Agent** receives context + user question
5. **Coach processes** through LLMs (Groq + DeepSeek)
6. **Response** considers all personal constraints and history

### @ Mention System:
- `@profile` → queries `user_profiles`
- `@health` → queries `health_metrics`
- `@today` → queries `daily_tracking` for current date
- `@meals` → queries `diet_entries` (last 7 days)
- `@habits` → queries `habits` (active ones)
- `@reminders` → queries `reminders` (active ones)

---

## 🔧 Simple Implementation Steps

### Step 1: Backend Services
1. Create `AgentService` class that queries all tables efficiently
2. Implement data retrieval methods for each table
3. Create `LLMService` to handle Groq + DeepSeek integration

### Step 2: Frontend Components
1. Update `ChatInput` to handle @ mentions with dropdown suggestions
2. Update `ChatInterface` to process dual agent responses (thinking + response)
3. Add image upload capability with preview

### Step 3: Database Integration
1. Ensure RLS policies are properly configured for all tables
2. Add proper indexes for efficient querying
3. Test data access patterns from the frontend

### Step 4: Test Integration
1. Test @ mention functionality end-to-end
2. Test image upload and analysis
3. Test dual agent response generation
4. Verify all data constraints are respected

This implementation maintains your current architecture while adding the dual agent functionality. The system leverages all your rich user data across the 7 tables to deliver personalized recommendations exactly as specified in your PRD.