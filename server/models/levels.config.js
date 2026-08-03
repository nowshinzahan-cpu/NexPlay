/**
 * Level thresholds for gamification.
 * Each level requires totalPoints to reach.
 * Level 1 = 0-99, Level 2 = 100-249, etc.
 */
const LEVEL_THRESHOLDS = [
  { level: 1, minPoints: 0, title: 'Newcomer' },
  { level: 2, minPoints: 100, title: 'Explorer' },
  { level: 3, minPoints: 250, title: 'Contributor' },
  { level: 4, minPoints: 500, title: 'Enthusiast' },
  { level: 5, minPoints: 1000, title: 'Expert' },
  { level: 6, minPoints: 2000, title: 'Specialist' },
  { level: 7, minPoints: 3500, title: 'Veteran' },
  { level: 8, minPoints: 5000, title: 'Master' },
  { level: 9, minPoints: 7500, title: 'Grandmaster' },
  { level: 10, minPoints: 10000, title: 'Legend' }
];

/**
 * Points awarded for each action type.
 */
const ACTION_POINTS = {
  review_created: 50,
  review_liked: 5,
  discussion_created: 30,
  comment_created: 15,
  comment_liked: 3,
  favorite_added: 10,
  daily_login: 5,
  login_streak: 10,
  badge_earned: 25,
  profile_completed: 20,
  watchlist_added: 5
};

/**
 * Calculate level from total points.
 */
function calculateLevel(totalPoints) {
  let currentLevel = LEVEL_THRESHOLDS[0];
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalPoints >= LEVEL_THRESHOLDS[i].minPoints) {
      currentLevel = LEVEL_THRESHOLDS[i];
      break;
    }
  }
  return currentLevel;
}

/**
 * Get progress toward next level.
 */
function getLevelProgress(totalPoints) {
  const current = calculateLevel(totalPoints);
  const nextIndex = LEVEL_THRESHOLDS.findIndex(l => l.level === current.level) + 1;
  
  if (nextIndex >= LEVEL_THRESHOLDS.length) {
    return { currentLevel: current, nextLevel: null, progress: 1, pointsToNext: 0 };
  }

  const next = LEVEL_THRESHOLDS[nextIndex];
  const range = next.minPoints - current.minPoints;
  const progress = (totalPoints - current.minPoints) / range;
  
  return {
    currentLevel: current,
    nextLevel: next,
    progress: Math.min(1, Math.max(0, progress)),
    pointsToNext: Math.max(0, next.minPoints - totalPoints)
  };
}

module.exports = {
  LEVEL_THRESHOLDS,
  ACTION_POINTS,
  calculateLevel,
  getLevelProgress
};
