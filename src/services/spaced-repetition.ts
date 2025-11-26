/**
 * SM-2 Spaced Repetition Algorithm
 * Used to calculate the next review date for flashcards
 */

export interface SM2Result {
  easinessFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
}

/**
 * Calculate next review using SM-2 algorithm
 * @param quality - Quality of recall (0-2): 0 = hard, 1 = medium, 2 = easy
 * @param repetitions - Number of consecutive correct repetitions
 * @param easinessFactor - Easiness factor (minimum 1.3)
 * @param interval - Current interval in days
 */
export function calculateNextReview(
  quality: number,
  repetitions: number,
  easinessFactor: number,
  interval: number
): SM2Result {
  let newEasinessFactor = easinessFactor;
  let newRepetitions = repetitions;
  let newInterval = interval;

  // Update easiness factor
  // EF' = EF + (0.1 - (2 - q) * (0.08 + (2 - q) * 0.02))
  // Simplified for our 3-point scale:
  // quality 0 (hard) -> decrease EF
  // quality 1 (medium) -> keep EF roughly the same
  // quality 2 (easy) -> increase EF
  if (quality === 0) {
    newEasinessFactor = Math.max(1.3, easinessFactor - 0.2);
    newRepetitions = 0;
    newInterval = 1;
  } else if (quality === 1) {
    newEasinessFactor = Math.max(1.3, easinessFactor - 0.05);
    newRepetitions = repetitions + 1;

    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 3;
    } else {
      newInterval = Math.round(interval * newEasinessFactor);
    }
  } else {
    // quality === 2 (easy)
    newEasinessFactor = Math.min(2.5, easinessFactor + 0.1);
    newRepetitions = repetitions + 1;

    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEasinessFactor);
    }
  }

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    easinessFactor: newEasinessFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewDate,
  };
}

/**
 * Convert difficulty rating string to quality number
 */
export function ratingToQuality(rating: 'hard' | 'medium' | 'easy'): number {
  switch (rating) {
    case 'hard':
      return 0;
    case 'medium':
      return 1;
    case 'easy':
      return 2;
  }
}
