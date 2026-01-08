import type {
  StudyRoute,
  StudyTopic,
  StudySubtopic,
  StudySubsubtopic,
  TopicWithChildren,
  SubtopicWithChildren,
  RouteWithTree,
  Difficulty,
} from '@/types/knowledge-hub';

export function calculateProgress(
  topics: (StudyTopic | TopicWithChildren)[],
  subtopics: StudySubtopic[] = [],
  subsubtopics: StudySubsubtopic[] = []
): number {
  // Flatten all items
  const allItems: Array<{ is_completed: boolean }> = [
    ...topics,
    ...subtopics,
    ...subsubtopics,
  ];

  // If topics have children, include them
  topics.forEach((topic) => {
    if ('subtopics' in topic) {
      allItems.push(...topic.subtopics);
      topic.subtopics.forEach((subtopic) => {
        if ('subsubtopics' in subtopic) {
          allItems.push(...subtopic.subsubtopics);
        }
      });
    }
  });

  if (allItems.length === 0) return 0;

  const completed = allItems.filter((item) => item.is_completed).length;
  return Math.round((completed / allItems.length) * 100);
}

export function formatEstimatedTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}min`;
}

export function getDifficultyColor(difficulty: Difficulty): string {
  const colors = {
    facil: 'text-green-400 bg-green-500/20 border-green-500/30',
    medio: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    dificil: 'text-red-400 bg-red-500/20 border-red-500/30',
  };
  return colors[difficulty];
}

export function getDifficultyLabel(difficulty: Difficulty): string {
  const labels = {
    facil: 'Fácil',
    medio: 'Medio',
    dificil: 'Difícil',
  };
  return labels[difficulty];
}

export function getStatusColor(status: StudyRoute['status']): string {
  const colors = {
    en_curso: 'text-primary bg-primary/20 border-primary/30',
    completado: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    pendiente: 'text-slate-400 bg-white/5 border-white/10',
    en_pausa: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
  };
  return colors[status];
}

export function getStatusLabel(status: StudyRoute['status']): string {
  const labels = {
    en_curso: 'En Curso',
    completado: 'Completado',
    pendiente: 'Pendiente',
    en_pausa: 'En Pausa',
  };
  return labels[status];
}

export function buildRouteTree(
  route: StudyRoute,
  topics: StudyTopic[],
  subtopics: StudySubtopic[],
  subsubtopics: StudySubsubtopic[]
): RouteWithTree {
  // Build subtopics map
  const subtopicsByTopicId = new Map<string, SubtopicWithChildren[]>();
  subtopics.forEach((subtopic) => {
    if (!subtopicsByTopicId.has(subtopic.topic_id)) {
      subtopicsByTopicId.set(subtopic.topic_id, []);
    }
    subtopicsByTopicId.get(subtopic.topic_id)!.push({
      ...subtopic,
      subsubtopics: [],
    });
  });

  // Build subsubtopics map
  const subsubtopicsBySubtopicId = new Map<string, StudySubsubtopic[]>();
  subsubtopics.forEach((subsubtopic) => {
    if (!subsubtopicsBySubtopicId.has(subsubtopic.subtopic_id)) {
      subsubtopicsBySubtopicId.set(subsubtopic.subtopic_id, []);
    }
    subsubtopicsBySubtopicId.get(subsubtopic.subtopic_id)!.push(subsubtopic);
  });

  // Attach subsubtopics to subtopics
  subtopicsByTopicId.forEach((subs) => {
    subs.forEach((sub) => {
      sub.subsubtopics = subsubtopicsBySubtopicId.get(sub.id) || [];
      // Sort by order_index
      sub.subsubtopics.sort((a, b) => a.order_index - b.order_index);
    });
    // Sort subtopics by order_index
    subs.sort((a, b) => a.order_index - b.order_index);
  });

  // Build topics with children
  const topicsWithChildren: TopicWithChildren[] = topics
    .map((topic) => ({
      ...topic,
      subtopics: subtopicsByTopicId.get(topic.id) || [],
    }))
    .sort((a, b) => a.order_index - b.order_index);

  return {
    ...route,
    topics: topicsWithChildren,
  };
}

export function getTotalEstimatedTime(
  topics: (StudyTopic | TopicWithChildren)[]
): number {
  let total = 0;

  topics.forEach((topic) => {
    total += topic.estimated_time_minutes;

    if ('subtopics' in topic) {
      topic.subtopics.forEach((subtopic) => {
        total += subtopic.estimated_time_minutes;

        if ('subsubtopics' in subtopic) {
          subtopic.subsubtopics.forEach((subsubtopic) => {
            total += subsubtopic.estimated_time_minutes;
          });
        }
      });
    }
  });

  return total;
}

