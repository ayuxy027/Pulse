# 🧬 AI-Based Healthcare Platform – Updated Feature KT

## Core Features

### 1. Image Query of Food 🍱

**Purpose**: Let users upload or snap a picture of their meal to get instant nutrition analysis.

**Functionality**:
- Detects the dish via AI/ML image recognition.
- Returns:
  - Calories
  - Nutrient breakdown
  - Pros & cons
  - Healthy / Not verdict
  - Immunity impact (boosting/suppressing foods based on user profile)

**Notes for Devs**: Use AI model + Supabase for dietary context (e.g., allergies, diet type).

---

### 2. Intake & Diet Management 🥤

**Purpose**: Track and manage daily nutrition and hydration, aligned with immunity goals.

**Functionality**:
- Diet Agent checks daily intake limits, calorie goals, and water intake.
- Recommends recipes and supplements based on user profile.
- Integrates with the tracker to update logs automatically.

**Notes**: Ensure diet recommendations consider user's diet type (veg/non-veg/jain), allergies, and health goals.

---

### 3. Coach System (Updated Dual-Agent Chat System) 💬

**Purpose**: Provide real-time, context-aware health guidance through a single chat interface with image attachment capabilities.

**Agents & Flow**:
- **Analyzer Agent**:
  - Reads Supabase user data (meals, water intake, BMI, health goals, lifestyle habits).
  - Summarizes current status and immunity-related context.

- **Coach Agent**:
  - Reads context from Analyzer and responds to user queries.
  - Provides advice on food choices, supplements, and lifestyle adjustments.
  - Can receive image attachments of meals for analysis and recommendations.
  - Integrates with Image Query functionality for seamless user experience.

**Example**:
- User: "Can I eat pizza tonight?" → AI: "You've already had pizza today and calorie intake is high — better skip tonight 🍕."
- User: [Attaches meal image] → AI: Provides nutrition analysis and personalized recommendations based on user profile.

**Notes**: Single chat interface, context auto-updates after every interaction, supports image attachments.

---

### 4. Chat History Section 📜

**Purpose**: Allow users to quickly recall previous interactions and advice.

**Functionality**:
- Displays recent chats on homepage.
- Clicking a chat opens the full dual-agent chat.

**Notes**: Not a major feature — purely supportive. Data fetched from Supabase chat_history table.

---

### 5. Tracker / Dashboard 📊

**Purpose**: Unified interface for monitoring all health metrics and progress.

**Functionality**:
- **Diet Planner**: View weekly meal plans, intake logs, and nutrition summaries.
- **Water & Workout Tracker**: Log daily water intake and workouts.
- **Calendar View**: Visualize total calories, water, workouts, and other metrics over days/weeks.
- **Immunity Index**: Simple score calculated from BMI, diet, hydration, last illness, and activity.
- **Pattern Recognition**: AI-powered analysis of user's historical data to identify trends and optimize recommendations.

**Gamification Layer**:
- Track streaks (hydration streak, workout streak, diet compliance).
- Reward badges or points for meeting goals.
- Encourage engagement via personalized messages and progress feedback.

**Notes**: Dashboard acts as central hub — all other features feed into it for a unified experience.

---

## New Features for Personalized Diet Planning

### 6. AI-Powered Pattern-Based Meal Planning 📊

**Purpose**: Analyze user's historical meal entries to identify patterns in food preferences, timing, and nutrient intake for personalized meal planning.

**Functionality**:
- Machine learning algorithm that identifies what foods the user consistently enjoys and when they prefer certain meals.
- Creates plans that align with these patterns while optimizing nutrition.
- Predictive nutritional gap analysis based on historical patterns.

**Notes**: Leverages extensive user data collection to identify patterns for truly personalized diet planning.

---

### 7. Behavioral Pattern Adaptation 🧠

**Purpose**: Adapt meal plans based on user's actual behavior patterns and lifestyle.

**Functionality**:
- Adjusts meal plans based on user's actual behavior patterns (which meals they consistently log vs. skip, timing preferences, etc.).
- If user skips breakfast regularly, suggests grab-and-go options; if they prefer larger dinners, adjusts distribution accordingly.
- Correlates symptom patterns with food intake to identify potential triggers or beneficial foods.

**Notes**: Uses daily tracking data to detect patterns in meal consistency, timing, and completion rates.

---

### 8. Genomic-Informed Nutritional Recommendations 🔬

**Purpose**: Analyze user's genetic/epigenetic profile to recommend foods that optimize their specific genetic markers.

**Functionality**:
- Based on user health profile, recommend specific nutrients that their genetic makeup may need more of (e.g., specific B vitamins, antioxidants, etc.).
- Provide personalized anti-inflammatory meal sequencing based on user's health profile.
- Implement predictive immunity support planning using historical data patterns.

**Notes**: Directly addresses using genomic/epigenomic data for personalized nutrition as per problem statement.

---

## Key Points for Teammates

**Data Architecture**:
- All features feed into Supabase: user profile, intake logs, chat history.
- Supabase tables include: user_profiles, health_metrics, daily_tracking, diet_entries, habits, reminders, chat_history.

**AI Architecture**:
- Dual-agent chat (Coach System) is the core intelligence layer — all recommendations flow through it.
- Analyzer Agent provides user context, Coach Agent provides responses.
- Image analysis integrates with Coach Agent for meal recommendations.

**Feature Hierarchy**:
- **Core**: Coach System (Dual-Agent Chat) + Diet management
- **Intermediate**: Image query + Genomic-informed recommendations
- **Supporting**: Tracker/Dashboard + Chat history + Pattern recognition

**Engagement Strategy**:
- Gamification + personalized immunity scoring = increases user engagement.
- Personalized recommendations based on extensive data collection and pattern recognition.

**Problem Statement Alignment**:
- System analyzes user's genomic (simulated), epigenomic (simulated), and lifestyle data.
- Offers personalized immunity enhancement strategies through nutritional recommendations.
- Implements real-time immunity-boosting recommendations via Coach Agent.
- Maintains privacy of sensitive data through secure Supabase implementation.

This centralized KT provides a comprehensive view of all features for the entire team, with clear purpose, functionality, and implementation notes for each component.