CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(50) NOT NULL CHECK (gender IN ('Male', 'Female', 'Prefer not to say', 'Other')),
  
  -- Diet
  diet_type VARCHAR(50) NOT NULL CHECK (diet_type IN ('Vegetarian', 'Non-Vegetarian', 'Vegan', 'Jain', 'Eggetarian')),
  
  -- Allergies
  has_food_allergies BOOLEAN DEFAULT FALSE,
  food_allergies_details TEXT,
  
  -- Medical
  medical_conditions TEXT[] DEFAULT '{}',
  medical_conditions_other TEXT,
  
  -- Medication
  on_regular_medication BOOLEAN DEFAULT FALSE,
  medication_details TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- ============================================
-- 2. HEALTH METRICS TABLE (Long-term Dynamic)
-- ============================================
CREATE TABLE IF NOT EXISTS health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Measurements
  height_cm INTEGER NOT NULL,
  current_weight_kg DECIMAL(5,2) NOT NULL,
  
  -- Goals & Lifestyle
  goal VARCHAR(50) NOT NULL CHECK (goal IN ('Weight Loss', 'Weight Gain', 'Maintain', 'Boost Immunity')),
  physical_activity_level VARCHAR(50) NOT NULL CHECK (physical_activity_level IN ('Sedentary', 'Light', 'Moderate', 'High')),
  
  -- Habits
  smoking_habits VARCHAR(50) NOT NULL CHECK (smoking_habits IN ('Yes', 'No', 'Sometimes')),
  alcohol_consumption VARCHAR(50) NOT NULL CHECK (alcohol_consumption IN ('Never', 'Occasionally', 'Often')),
  
  -- Tracking
  recorded_date DATE NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_health_metrics_user_id ON health_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_health_metrics_recorded_date ON health_metrics(user_id, recorded_date DESC);

-- ============================================
-- 3. DAILY TRACKING TABLE (Real-time Updates)
-- ============================================
CREATE TABLE IF NOT EXISTS daily_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tracked_date DATE NOT NULL,
  
  -- Meals
  breakfast_logged BOOLEAN DEFAULT FALSE,
  breakfast_time TIME,
  breakfast_image_url VARCHAR(500),
  breakfast_notes TEXT,
  
  lunch_logged BOOLEAN DEFAULT FALSE,
  lunch_time TIME,
  lunch_image_url VARCHAR(500),
  lunch_notes TEXT,
  
  dinner_logged BOOLEAN DEFAULT FALSE,
  dinner_time TIME,
  dinner_image_url VARCHAR(500),
  dinner_notes TEXT,
  
  -- Hydration
  water_glasses INTEGER DEFAULT 0,
  water_bottles INTEGER,
  
  -- Sleep
  sleep_hours DECIMAL(3,1) DEFAULT 0,
  sleep_quality VARCHAR(50) CHECK (sleep_quality IS NULL OR sleep_quality IN ('Poor', 'Fair', 'Good', 'Excellent')),
  
  -- Exercise
  exercise_logged BOOLEAN DEFAULT FALSE,
  exercise_type VARCHAR(100) CHECK (exercise_type IS NULL OR exercise_type IN ('Running', 'Walking', 'Yoga', 'Strength Training', 'Cycling', 'Sports', 'Other')),
  exercise_duration_minutes INTEGER,
  exercise_notes TEXT,
  
  -- Symptoms
  symptoms TEXT[] DEFAULT '{}',
  symptoms_notes TEXT,
  
  -- Mood/Stress
  stress_mood_level INTEGER CHECK (stress_mood_level >= 1 AND stress_mood_level <= 5),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: One entry per user per day
  UNIQUE(user_id, tracked_date)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_daily_tracking_user_id ON daily_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_tracking_tracked_date ON daily_tracking(user_id, tracked_date DESC);

-- ============================================
-- 4. MEAL IMAGES STORAGE BUCKET
-- ============================================
-- Note: This needs to be set up in Supabase dashboard or via admin API
-- Create a storage bucket named "meal-images" with the following settings:
-- - Public: false (private)
-- - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
-- - Max file size: 5MB

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tracking ENABLE ROW LEVEL SECURITY;

-- User Profiles RLS
CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Health Metrics RLS
CREATE POLICY "Users can view their own health metrics"
  ON health_metrics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health metrics"
  ON health_metrics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health metrics"
  ON health_metrics
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Daily Tracking RLS
CREATE POLICY "Users can view their own daily tracking"
  ON daily_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily tracking"
  ON daily_tracking
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily tracking"
  ON daily_tracking
  FOR UPDATE
  USING (auth.uid() = user_id);