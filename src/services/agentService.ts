import { createClient } from '@supabase/supabase-js';
import { getGroqResponse, getDeepSeekResponse } from './llmService';
import { storeChatMessage } from './chatService';

interface UserHealthContext {
  profile: any;
  healthMetrics: any;
  dailyTracking: any;
  dietEntries: any[];
  habits: any[];
  reminders: any[];
}

export class AgentService {
  private supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
  );

  async analyzeUserContext(userId: string, contextFilter?: string[]): Promise<UserHealthContext> {
    // If context filter specified (from @ mentions), only fetch relevant data
    const fetchAll = !contextFilter || contextFilter.length === 0;
    
    console.log('🔍 Fetching user context:', { userId, contextFilter, fetchAll });
    
    // Helper to safely execute queries with error handling
    const safeQuery = async (queryFn: () => any, defaultData: any = null, queryName: string) => {
      try {
        console.log(`📊 Executing query: ${queryName}`);
        const result = await queryFn();
        console.log(`✅ ${queryName} result:`, result);
        return result;
      } catch (error) {
        console.error(`❌ Query error for ${queryName}:`, error);
        return { data: defaultData };
      }
    };
    
    const [profile, healthMetrics, dailyTracking, dietEntries, habits, reminders] = 
      await Promise.all([
        fetchAll || contextFilter?.includes('profile')
          ? safeQuery(() => this.getUserProfile(userId), null, 'getUserProfile')
          : Promise.resolve({ data: null }),
        
        fetchAll || contextFilter?.includes('health')
          ? safeQuery(() => this.getHealthMetrics(userId), null, 'getHealthMetrics')
          : Promise.resolve({ data: null }),
        
        fetchAll || contextFilter?.includes('today')
          ? safeQuery(() => this.getDailyTracking(userId), null, 'getDailyTracking')
          : Promise.resolve({ data: null }),
        
        fetchAll || contextFilter?.includes('meals')
          ? safeQuery(() => this.getDietEntries(userId), [], 'getDietEntries')
          : Promise.resolve({ data: [] }),
        
        fetchAll || contextFilter?.includes('habits')
          ? safeQuery(() => this.getHabits(userId), [], 'getHabits')
          : Promise.resolve({ data: [] }),
        
        fetchAll || contextFilter?.includes('reminders')
          ? safeQuery(() => this.getReminders(userId), [], 'getReminders')
          : Promise.resolve({ data: [] })
      ]);

    console.log('📦 Final context data:', {
      profile,
      healthMetrics,
      dailyTracking,
      dietEntries: dietEntries?.data?.length || 0,
      habits: habits?.data?.length || 0,
      reminders: reminders?.data?.length || 0
    });

    return {
      profile: profile?.data?.[0] || null,
      healthMetrics: healthMetrics?.data?.[0] || null,
      dailyTracking: dailyTracking?.data?.[0] || null,
      dietEntries: dietEntries?.data || [],
      habits: habits?.data || [],
      reminders: reminders?.data || []
    };
  }

  async processUserQuery(
    userId: string, 
    userQuery: string, 
    contextFilter?: string[],
    chatId?: string | null
  ): Promise<any> {
    // Phase 1: Auto-detect tool calls needed based on query content
    const autoDetectedTools = this.autoDetectRequiredTools(userQuery);
    const finalContextFilter = contextFilter || autoDetectedTools;
    
    // Phase 2: Analysis - Fetch user data with auto-detected tools
    const context = await this.analyzeUserContext(userId, finalContextFilter);
    
    // Phase 3: Format context for agents
    const contextSummary = this.formatContextForAgent(context);
    
    // Phase 4: Dual Agent Response
    const result = await this.getDualAgentResponse(userQuery, contextSummary);
    
    // Phase 5: Store messages in database
    const currentChatId = chatId || null;
    
    // Store user message
    const userChatResult = await storeChatMessage(
      userId,
      currentChatId,
      { role: 'user', content: userQuery }
    );
    
    // Store assistant response with the chat_id from user message
    await storeChatMessage(
      userId,
      userChatResult.chatId,
      { role: 'assistant', content: result.response }
    );
    
    return {
      ...result,
      chatId: userChatResult.chatId,
      autoDetectedTools: autoDetectedTools
    };
  }

  private async getDualAgentResponse(userQuery: string, context: string) {
    // Analyzer Agent (Groq - gpt-oss-20b): Think and analyze
    const analyzerPrompt = `You are an AI health analyzer. Analyze the user's health data and question to provide thoughtful insights.

USER HEALTH DATA:
${context}

USER QUESTION: ${userQuery}

Think step by step about:
1. What health information is relevant to answer this question?
2. What constraints or considerations should be noted? (diet type, allergies, medical conditions, recent meals, etc.)
3. What personalized insights can you provide?

Provide a concise analysis (2-3 sentences maximum).`;

    const groqResponse = await getGroqResponse(analyzerPrompt);
    
    // Coach Agent (Groq - gpt-oss-20b): Generate personalized response
    const coachPrompt = `You are a friendly, knowledgeable health coach. Provide personalized health and nutrition advice.

CONTEXT ANALYSIS:
${groqResponse}

USER QUESTION: ${userQuery}

USER HEALTH DATA:
${context}

INSTRUCTIONS:
- Be conversational and warm
- Use the health data to provide personalized recommendations
- Consider dietary restrictions, medical conditions, and recent meals
- Structure your response with clear sections using markdown formatting
- Use bullet points, headers, and emphasis for better readability
- Keep response concise but helpful (3-4 sentences per section)
- Use emojis sparingly for friendliness
- If health data is limited, still provide general helpful advice
- If the user's health data indicates protein deficiency or lack of protein intake, suggest these protein supplement referral links:
  - https://www.fuelone.in/
  - https://www.muscleblaze.com/
  - https://www.gnc.com/protein/
  - https://nutrabay.com/

FORMAT YOUR RESPONSE WITH:
- ## Key Insights (main recommendations)
- ## Action Items (specific steps to take)
- ## Additional Tips (extra helpful information)

Respond as a caring health coach:`;

    const deepSeekResponse = await getDeepSeekResponse(coachPrompt);

    return {
      thinking: groqResponse, // What the analyzer thought
      response: deepSeekResponse, // Final coach response
      contextUsed: context
    };
  }

  // Helper methods for data retrieval from Supabase
  private getUserProfile(userId: string) {
    console.log('🔎 Querying user_profiles for userId:', userId);
    return this.supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
  }

  private getHealthMetrics(userId: string) {
    console.log('🔎 Querying health_metrics for userId:', userId);
    return this.supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_date', { ascending: false })
      .limit(1)
      .maybeSingle();
  }

  private getDailyTracking(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    console.log('🔎 Querying daily_tracking for userId:', userId, 'date:', today);
    return this.supabase
      .from('daily_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('tracked_date', today)
      .maybeSingle();
  }

  private getDietEntries(userId: string) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    console.log('🔎 Querying diet_entries for userId:', userId, 'since:', weekAgo.toISOString());
    return this.supabase
      .from('diet_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', weekAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(20);
  }

  private getHabits(userId: string) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    console.log('🔎 Querying habits for userId:', userId, 'since:', weekAgo.toISOString());
    return this.supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', weekAgo.toISOString())
      .order('created_at', { ascending: false });
  }

  private getReminders(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    console.log('🔎 Querying reminders for userId:', userId, 'date:', today);
    return this.supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .gte('reminder_date', today)
      .order('reminder_date', { ascending: true });
  }

  private autoDetectRequiredTools(userQuery: string): string[] {
    const query = userQuery.toLowerCase();
    const detectedTools: string[] = [];
    
    // Profile-related queries
    if (query.includes('profile') || query.includes('about me') || query.includes('my info') || 
        query.includes('diet type') || query.includes('allergies') || query.includes('medical')) {
      detectedTools.push('profile');
    }
    
    // Health metrics queries
    if (query.includes('weight') || query.includes('height') || query.includes('bmi') || 
        query.includes('goal') || query.includes('health') || query.includes('metrics') ||
        query.includes('fitness') || query.includes('body')) {
      detectedTools.push('health');
    }
    
    // Today's tracking queries
    if (query.includes('today') || query.includes('water') || query.includes('sleep') || 
        query.includes('symptoms') || query.includes('tracking') || query.includes('daily')) {
      detectedTools.push('today');
    }
    
    // Diet/meals queries
    if (query.includes('meal') || query.includes('food') || query.includes('eat') || 
        query.includes('diet') || query.includes('nutrition') || query.includes('calories') ||
        query.includes('breakfast') || query.includes('lunch') || query.includes('dinner')) {
      detectedTools.push('meals');
    }
    
    // Habits queries
    if (query.includes('habit') || query.includes('routine') || query.includes('exercise') ||
        query.includes('workout') || query.includes('activity')) {
      detectedTools.push('habits');
    }
    
    // Reminders queries
    if (query.includes('reminder') || query.includes('schedule') || query.includes('appointment') ||
        query.includes('medication') || query.includes('pill')) {
      detectedTools.push('reminders');
    }
    
    // If no specific tools detected, fetch all for comprehensive response
    if (detectedTools.length === 0) {
      return ['profile', 'health', 'today', 'meals', 'habits', 'reminders'];
    }
    
    return detectedTools;
  }

  private formatContextForAgent(context: UserHealthContext): string {
    console.log('📝 Formatting context for agent:', context);
    const lines: string[] = [];
    
    // Profile data
    if (context.profile) {
      lines.push(`DIET TYPE: ${context.profile.diet_type || 'Not specified'}`);
      if (context.profile.has_food_allergies && context.profile.food_allergies_details) {
        lines.push(`ALLERGIES: ${context.profile.food_allergies_details}`);
      }
      if (context.profile.medical_conditions && context.profile.medical_conditions.length > 0) {
        lines.push(`MEDICAL CONDITIONS: ${context.profile.medical_conditions.join(', ')}`);
      }
      if (context.profile.on_regular_medication && context.profile.medication_details) {
        lines.push(`MEDICATIONS: ${context.profile.medication_details}`);
      }
    }
    
    // Health metrics
    if (context.healthMetrics) {
      lines.push(`HEIGHT: ${context.healthMetrics.height_cm}cm, WEIGHT: ${context.healthMetrics.current_weight_kg}kg`);
      lines.push(`GOAL: ${context.healthMetrics.goal}`);
      lines.push(`ACTIVITY LEVEL: ${context.healthMetrics.physical_activity_level}`);
    }
    
    // Today's tracking
    if (context.dailyTracking) {
      lines.push(`WATER TODAY: ${context.dailyTracking.water_glasses || 0} glasses`);
      lines.push(`SLEEP: ${context.dailyTracking.sleep_hours || 0}h`);
      if (context.dailyTracking.symptoms && context.dailyTracking.symptoms.length > 0) {
        lines.push(`SYMPTOMS: ${context.dailyTracking.symptoms.join(', ')}`);
      }
    }
    
    // Recent meals
    if (context.dietEntries.length > 0) {
      lines.push(`RECENT MEALS (last 7 days):`);
      context.dietEntries.slice(0, 5).forEach(entry => {
        if (entry.entry_type === 'meal') {
          lines.push(`  - ${entry.meal_type}: ${entry.meal_description} (${entry.nutrition?.calories || 0} cal)`);
        }
      });
    }
    
    // Active habits
    if (context.habits.length > 0) {
      const activeHabits = context.habits.filter(h => h.is_completed);
      if (activeHabits.length > 0) {
        lines.push(`COMPLETED HABITS:`);
        activeHabits.slice(0, 3).forEach(habit => {
          lines.push(`  - ${habit.description}`);
        });
      }
    }
    
    // Upcoming reminders
    if (context.reminders.length > 0) {
      lines.push(`UPCOMING REMINDERS:`);
      context.reminders.slice(0, 3).forEach(reminder => {
        lines.push(`  - ${reminder.description}`);
      });
    }
    
    return lines.length > 0 ? lines.join('\n') : 'No health data available.';
  }
}