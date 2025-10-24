import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fjrkdqrcoxtztqquikig.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqcmtkcXJjb3h0enRxcXVpa2lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjY3MTQsImV4cCI6MjA3NjkwMjcxNH0.bQcS88MPn5w3HAVNpikh5kWYg-y5IrDh87BxAmHjGqY'

export const supabase = createClient(supabaseUrl, supabaseKey)
