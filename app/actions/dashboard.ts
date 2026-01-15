'use server';

import { createClient } from '@/lib/supabase/server';

interface MainRoute {
  id: string;
  title: string;
  description: string | null;
  code: string | null;
  progress: number;
  current_topic: {
    id: string;
    name: string;
    description: string | null;
  } | null;
  current_subtopic: {
    id: string;
    name: string;
    description: string | null;
  } | null;
}

interface PerformanceMetrics {
  precision: number;
  precisionChange: number;
  timeToday: number; // in hours
  weeklyData: Array<{ day: string; value: number }>;
}

// Get main route (most recent or with most progress)
export async function getMainRoute(): Promise<
  { success: true; data: MainRoute | null } | { success: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // Get all routes for the user
  const { data: routes, error: routesError } = await supabase
    .from('study_routes')
    .select('id, title, description')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (routesError) {
    console.error('Error fetching routes:', routesError);
    return { success: false, error: routesError.message };
  }

  if (!routes || routes.length === 0) {
    return { success: true, data: null };
  }

  // Get the most recent route (or you could calculate progress and pick the one with most progress)
  const mainRoute = routes[0];

  // Calculate progress: count completed topics/subtopics vs total
  const { data: topics, error: topicsError } = await supabase
    .from('study_topics')
    .select('id, name, description, is_completed')
    .eq('route_id', mainRoute.id)
    .order('order_index');

  // If there's an error getting topics, still return the route with 0 progress
  if (topicsError) {
    console.error('Error fetching topics:', topicsError);
    // Return route with 0 progress instead of failing
    return {
      success: true,
      data: {
        id: mainRoute.id,
        title: mainRoute.title,
        description: mainRoute.description,
        code: null,
        progress: 0,
        current_topic: null,
        current_subtopic: null,
      },
    };
  }

  // Get all subtopics for this route
  const topicIds = topics?.map((t) => t.id) || [];
  const { data: subtopics } = await supabase
    .from('study_subtopics')
    .select('id, topic_id, is_completed')
    .in('topic_id', topicIds);

  // Get all subsubtopics
  const subtopicIds = subtopics?.map((s) => s.id) || [];
  const { data: subsubtopics } = await supabase
    .from('study_subsubtopics')
    .select('id, is_completed')
    .in('subtopic_id', subtopicIds);

  // Calculate progress based on is_completed flags
  const totalItems =
    (topics?.length || 0) + (subtopics?.length || 0) + (subsubtopics?.length || 0);
  const completedItems =
    (topics?.filter((t) => t.is_completed).length || 0) +
    (subtopics?.filter((s) => s.is_completed).length || 0) +
    (subsubtopics?.filter((s) => s.is_completed).length || 0);

  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Get current topic/subtopic (first incomplete or last completed)
  let currentTopic: { id: string; name: string; description: string | null } | null = null;
  let currentSubtopic: { id: string; name: string; description: string | null } | null = null;

  if (topics && topics.length > 0) {
    // Find first incomplete topic, or last completed topic if all are completed
    const incompleteTopic = topics.find((t) => !t.is_completed);
    const completedTopics = topics.filter((t) => t.is_completed);
    const selectedTopic = incompleteTopic || (completedTopics.length > 0 ? completedTopics[completedTopics.length - 1] : topics[0]);
    
    if (selectedTopic) {
      currentTopic = {
        id: selectedTopic.id,
        name: selectedTopic.name,
        description: selectedTopic.description,
      };

      const topicSubtopics = subtopics?.filter((s) => s.topic_id === selectedTopic.id) || [];
      if (topicSubtopics.length > 0) {
        // Find first incomplete subtopic, or last completed subtopic
        const incompleteSubtopic = topicSubtopics.find((s) => !s.is_completed);
        const completedSubtopics = topicSubtopics.filter((s) => s.is_completed);
        const targetSubtopic = incompleteSubtopic || (completedSubtopics.length > 0 ? completedSubtopics[completedSubtopics.length - 1] : topicSubtopics[0]);
        
        if (targetSubtopic) {
          const { data: subtopicData } = await supabase
            .from('study_subtopics')
            .select('id, name, description')
            .eq('id', targetSubtopic.id)
            .single();
          currentSubtopic = subtopicData || null;
        }
      }
    }
  }

  return {
    success: true,
    data: {
      id: mainRoute.id,
      title: mainRoute.title,
      description: mainRoute.description,
      code: null, // Code field doesn't exist in the schema, set to null
      progress: Math.min(progress, 100),
      current_topic: currentTopic
        ? {
            id: currentTopic.id,
            name: currentTopic.name,
            description: currentTopic.description,
          }
        : null,
      current_subtopic: currentSubtopic,
    },
  };
}

// Get performance metrics
export async function getPerformanceMetrics(
  period: 'daily' | 'weekly' | 'monthly' = 'weekly'
): Promise<
  { success: true; data: PerformanceMetrics } | { success: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0);

  // Get all assessment answers for precision calculation
  const { data: allAnswers, error: answersError } = await supabase
    .from('assessment_answers')
    .select('is_correct, time_spent_seconds, answered_at')
    .eq('user_id', user.id);

  if (answersError) {
    return { success: false, error: answersError.message };
  }

  // Calculate precision (overall)
  const totalAnswers = allAnswers?.length || 0;
  const correctAnswers = allAnswers?.filter((a) => a.is_correct).length || 0;
  const precision = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

  // Calculate precision change (compare last 7 days vs previous 7 days)
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(now.getDate() - 14);

  const recentAnswers = allAnswers?.filter(
    (a) => new Date(a.answered_at) >= sevenDaysAgo
  ) || [];
  const previousAnswers = allAnswers?.filter(
    (a) =>
      new Date(a.answered_at) >= fourteenDaysAgo && new Date(a.answered_at) < sevenDaysAgo
  ) || [];

  const recentPrecision =
    recentAnswers.length > 0
      ? Math.round(
          (recentAnswers.filter((a) => a.is_correct).length / recentAnswers.length) * 100
        )
      : 0;
  const previousPrecision =
    previousAnswers.length > 0
      ? Math.round(
          (previousAnswers.filter((a) => a.is_correct).length / previousAnswers.length) * 100
        )
      : 0;

  const precisionChange = recentPrecision - previousPrecision;

  // Calculate time today (in hours)
  const todayAnswers = allAnswers?.filter(
    (a) => new Date(a.answered_at) >= startOfToday
  ) || [];
  const timeTodaySeconds =
    todayAnswers.reduce((sum, a) => sum + (a.time_spent_seconds || 0), 0) || 0;
  const timeToday = Math.round((timeTodaySeconds / 3600) * 10) / 10; // Round to 1 decimal

  // Get weekly data (last 7 days)
  const weeklyData: Array<{ day: string; value: number }> = [];
  const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);

    const dayAnswers = allAnswers?.filter(
      (a) => {
        const answerDate = new Date(a.answered_at);
        return answerDate >= date && answerDate < nextDate;
      }
    ) || [];

    const dayTimeSeconds = dayAnswers.reduce((sum, a) => sum + (a.time_spent_seconds || 0), 0);
    const dayTimeHours = Math.round((dayTimeSeconds / 3600) * 100) / 100; // Round to 2 decimals

    weeklyData.push({
      day: dayNames[date.getDay()],
      value: dayTimeHours,
    });
  }

  return {
    success: true,
    data: {
      precision,
      precisionChange,
      timeToday,
      weeklyData,
    },
  };
}

interface FocusArea {
  topic_id: string;
  topic_name: string;
  route_title: string;
  precision: number;
  total_answers: number;
  correct_answers: number;
}

// Get focus areas (topics with lowest precision)
export async function getFocusAreas(): Promise<
  { success: true; data: FocusArea[] } | { success: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // Get all assessment answers with question topic information
  const { data: answers, error: answersError } = await supabase
    .from('assessment_answers')
    .select(`
      is_correct,
      question:questions(
        topic_id,
        topic:study_topics(
          id,
          name,
          route:study_routes(
            id,
            title
          )
        )
      )
    `)
    .eq('user_id', user.id)
    .not('question.topic_id', 'is', null);

  if (answersError) {
    return { success: false, error: answersError.message };
  }

  if (!answers || answers.length === 0) {
    return { success: true, data: [] };
  }

  // Group answers by topic_id and calculate precision
  const topicStats = new Map<
    string,
    {
      topic_id: string;
      topic_name: string;
      route_title: string;
      total: number;
      correct: number;
    }
  >();

  answers.forEach((answer: any) => {
    const question = answer.question;
    if (!question || !question.topic_id) return;

    const topic = Array.isArray(question.topic) ? question.topic[0] : question.topic;
    if (!topic) return;

    const route = Array.isArray(topic.route) ? topic.route[0] : topic.route;
    const topicId = topic.id;
    const topicName = topic.name;
    const routeTitle = route?.title || 'Sin ruta';

    if (!topicStats.has(topicId)) {
      topicStats.set(topicId, {
        topic_id: topicId,
        topic_name: topicName,
        route_title: routeTitle,
        total: 0,
        correct: 0,
      });
    }

    const stats = topicStats.get(topicId)!;
    stats.total++;
    if (answer.is_correct) {
      stats.correct++;
    }
  });

  // Convert to array and calculate precision, filter topics with at least 3 answers
  const focusAreas: FocusArea[] = Array.from(topicStats.values())
    .filter((stats) => stats.total >= 3) // Only include topics with at least 3 answers
    .map((stats) => ({
      topic_id: stats.topic_id,
      topic_name: stats.topic_name,
      route_title: stats.route_title,
      precision: Math.round((stats.correct / stats.total) * 100),
      total_answers: stats.total,
      correct_answers: stats.correct,
    }))
    .sort((a, b) => a.precision - b.precision) // Sort by precision (lowest first)
    .slice(0, 3); // Get top 3 (lowest precision)

  return { success: true, data: focusAreas };
}
