CREATE TABLE IF NOT EXISTS diet_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('water', 'meal')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  water_amount INTEGER,
  
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'snacks', 'dinner')),
  meal_description TEXT,
  meal_date DATE,
  meal_time TIME,
  nutrition JSONB,  -- {calories, protein, carbs, fat}
  
  CONSTRAINT valid_water_entry CHECK (
    (entry_type = 'water' AND water_amount IS NOT NULL AND water_amount > 0)
    OR entry_type != 'water'
  ),
  CONSTRAINT valid_meal_entry CHECK (
    (entry_type = 'meal' AND meal_type IS NOT NULL AND meal_description IS NOT NULL 
     AND meal_date IS NOT NULL AND meal_time IS NOT NULL)
    OR entry_type != 'meal'
  )
);