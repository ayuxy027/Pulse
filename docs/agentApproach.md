# 🤖 Dual Agent System Approach for Pulse.ai

## 🎯 Overview

This document outlines the approach used to implement the dual agent system for the Pulse.ai-MVP health and nutrition platform. The system consists of two specialized AI agents: an Analyzer Agent that processes user health data, and a Coach Agent that generates personalized recommendations based on that analysis.

## 🏗️ System Architecture

### Two-Phase Processing Model

```
User Query → Analyzer Agent → Context Summary → Coach Agent → Response → User
```

**Phase 1: Analysis**
- Analyzer Agent retrieves and processes user data from all Supabase tables
- Creates comprehensive health context summary
- Formats data for optimal AI processing

**Phase 2: Response Generation**
- Coach Agent receives user query + health context
- Generates personalized recommendations considering all user constraints
- Produces both thinking process and final response

## 🧠 Agent Specialization

### Analyzer Agent
**Purpose**: Data retrieval and context formatting
- Retrieves user data from all relevant tables
- Synthesizes information into a structured format
- Ensures all personal constraints are considered
- Formats for optimal AI processing

**Data Sources**:
- `user_profiles`: Diet type, allergies, medical conditions
- `health_metrics`: Goals, weight, activity level
- `daily_tracking`: Current day's health data
- `diet_entries`: Recent food intake history
- `habits`: Active habits and completion patterns
- `reminders`: Scheduled reminders and tasks

### Coach Agent
**Purpose**: Response generation and personalization
- Receives formatted context + user query
- Generates personalized health/nutrition advice
- Considers dietary restrictions and medical conditions
- Provides actionable recommendations

## 🔄 Data Flow Process

### 1. Query Processing
```
User Input → @ Mention Parser → Table Queries → Data Aggregation → Context Formation
```

### 2. @ Mention System
When user types `@`, the system presents relevant data types:
- `@profile`: User's static profile data
- `@health`: Current health metrics
- `@today`: Today's tracking data
- `@meals`: Recent diet entries
- `@habits`: Active habits
- `@reminders`: Active reminders

### 3. Database Integration
The system efficiently queries all 7 tables to create a complete user profile:
- **Efficient Queries**: Optimized to minimize database calls
- **Context Caching**: Recent data reused across conversations
- **Privacy Compliance**: RLS policies ensure data security

## 🎯 Personalization Strategy

### Multi-Table Data Synthesis
The system creates personalized responses by combining data from:
- Medical restrictions (from `user_profiles`)
- Health goals (from `health_metrics`)
- Real-time tracking (from `daily_tracking`)
- Historical patterns (from `diet_entries`)
- Behavioral insights (from `habits`)

### Condition-Aware Recommendations
- For diabetic users: Considers blood sugar impacts
- For PCOS users: Suggests low-GI foods
- For thyroid conditions: Adjusts iodine recommendations
- For allergies: Filters out problematic foods

## 🔧 Technical Implementation

### LLM Integration
- **Groq (Llama 3.1 distill)**: For initial analysis and thinking
- **DeepSeek (distill model)**: For final response generation
- **Dual Processing**: Ensures both analysis quality and response quality

### Frontend Integration
- **ChatInput Component**: Handles @ mentions with dropdown suggestions
- **ChatInterface**: Displays both thinking process and final response
- **Real-time Updates**: Reflects context changes immediately

### Error Handling & Fallbacks
- Graceful degradation when LLM services fail
- Fallback to rule-based recommendations
- Clear error messaging to users

## 📊 Tables Utilized

### 1. `user_profiles` - Personal Constraints
- Diet type (Vegetarian, Vegan, Non-Veg, etc.)
- Food allergies and medical conditions
- Medication details

### 2. `health_metrics` - Health Goals
- Current weight, height, BMI
- Health goal (Weight Loss, Gain, Maintain, Immunity)
- Activity level and lifestyle factors

### 3. `daily_tracking` - Real-time Data
- Today's meals, hydration, sleep
- Current symptoms and stress levels
- Exercise and activity tracking

### 4. `diet_entries` - Food History
- Historical food intake patterns
- Nutritional analysis of consumed foods
- Meal timing preferences

### 5. `habits` - Behavioral Patterns
- Active habits and completion rates
- Calorie burn estimation
- Behavior change tracking

### 6. `reminders` - Scheduled Tasks
- Upcoming health-related reminders
- Medication and supplement schedules
- Habit tracking prompts

## 🔑 Key Benefits

### 1. Comprehensive Context
- All user data synthesized for personalized responses
- No information silos between different health aspects

### 2. Real-time Adaptation
- Current day's data influences recommendations
- Dynamic adjustment based on user's real-time status

### 3. Privacy & Security
- RLS policies ensure user data isolation
- Minimal data exposure to external APIs

### 4. Scalable Architecture
- Modular design allows easy feature addition
- Efficient database queries minimize latency

## 🚀 Implementation Highlights

### Efficient Data Retrieval
- Batch queries to minimize API calls
- Optimized data structure for AI consumption

### Contextual Awareness
- Maintains conversation history and context
- Considers long-term patterns and short-term changes

### User Experience Focus
- Clear thinking process display for trust
- Intuitive @ mention system for data access
- Image upload for meal analysis

## 📈 Future Extensibility

This architecture allows for easy addition of:
- Additional AI models
- New health data sources
- Advanced analytics and pattern recognition
- Integration with wearable devices
- Predictive health insights

This approach ensures that the dual agent system delivers personalized, contextually-aware health recommendations while maintaining optimal performance and privacy standards.