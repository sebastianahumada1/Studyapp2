/**
 * Format a timestamp to relative time (e.g., "hace 2 h", "Ayer", "15 ene")
 */
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'Ahora';
  } else if (diffMins < 60) {
    return `hace ${diffMins} min`;
  } else if (diffHours < 24) {
    return `hace ${diffHours} h`;
  } else if (diffDays === 1) {
    return 'Ayer';
  } else if (diffDays < 7) {
    return `hace ${diffDays} días`;
  } else {
    // Format as "15 ene" or "24 de oct."
    const day = date.getDate();
    const monthNames = [
      'ene',
      'feb',
      'mar',
      'abr',
      'may',
      'jun',
      'jul',
      'ago',
      'sep',
      'oct',
      'nov',
      'dic',
    ];
    const month = monthNames[date.getMonth()];
    return `${day} de ${month}.`;
  }
}

/**
 * Build tutor role automatically based on selected hierarchy
 */
export function buildTutorRole(
  routeTitle?: string | null,
  topicName?: string | null,
  subtopicName?: string | null
): string {
  if (subtopicName && topicName && routeTitle) {
    return `Especialista en ${routeTitle} - ${topicName} - ${subtopicName}`;
  } else if (topicName && routeTitle) {
    return `Especialista en ${routeTitle} - ${topicName}`;
  } else if (routeTitle) {
    return `Especialista en ${routeTitle}`;
  }
  return 'Tutor IA General';
}

/**
 * Detect if the AI response indicates session completion
 */
export function detectCompletion(text: string): boolean {
  const completionKeywords = [
    'has comprendido',
    'has entendido',
    'comprendes correctamente',
    'entendiste',
    'sesión completada',
    'has logrado',
    'dominio del concepto',
    'has dominado',
    'comprendiste correctamente',
    'entendimiento completo',
    'objetivo alcanzado',
    'conceptos validados',
    'estás listo para avanzar',
  ];

  const lowerText = text.toLowerCase();
  return completionKeywords.some((keyword) => lowerText.includes(keyword));
}

/**
 * Extract anchor recommendation from AI response using regex patterns
 */
export function extractAnchorRecommendation(text: string): string | null {
  const anchorPatterns = [
    /💡\s*Anclaje:\s*(.+?)(?:\n|$)/i,
    /anclaje[:\s]+(.+?)(?:\.|$)/i,
    /recomend[ao].*?anclaje[:\s]+(.+?)(?:\.|$)/i,
    /suger[eo].*?memoria[:\s]+(.+?)(?:\.|$)/i,
    /anclaje de memoria[:\s]+(.+?)(?:\.|$)/i,
    /mnemotecnia[:\s]+(.+?)(?:\.|$)/i,
  ];

  for (const pattern of anchorPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}
