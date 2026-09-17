/**
 * Authoritative LifeRPG Progression Engine
 *
 * Single source of truth for Level and XP formulas:
 * - Level 1: requires 500 XP
 * - Level 2: requires 700 XP (+200)
 * - Level 3: requires 900 XP (+200)
 * - Level L: requires 500 + (L - 1) * 200 XP
 *
 * Momentum Points:
 * - Authoritative balance in profiles.momentum_points (default 0)
 * - momentumPoints and totalPoints are synchronized 1:1 in the frontend
 */

export interface ProgressionState {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  totalPoints: number;
  momentumPoints: number;
  leveledUp?: boolean;
}

/**
 * Returns the XP threshold needed to complete the given level.
 */
export function getXpRequiredForLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  return 500 + (safeLevel - 1) * 200;
}

/**
 * Calculates updated progression after adding/subtracting XP and Momentum Points.
 * Handles multiple level ups seamlessly.
 * Clamps XP at 0 on uncompletion without decreasing level.
 */
export function calculateProgressionDelta(
  current: {
    level?: number;
    currentXp?: number;
    nextLevelXp?: number;
    momentumPoints?: number;
    totalPoints?: number;
  },
  xpDelta: number,
  pointsDelta: number = xpDelta
): ProgressionState {
  let level = Math.max(1, current.level ?? 1);
  let currentXp = (current.currentXp ?? 0) + xpDelta;
  let nextLevelXp = current.nextLevelXp && current.nextLevelXp > 0
    ? current.nextLevelXp
    : getXpRequiredForLevel(level);

  const initialLevel = level;
  const currentPoints = current.momentumPoints ?? current.totalPoints ?? 0;
  const newPoints = Math.max(0, currentPoints + pointsDelta);

  if (xpDelta > 0) {
    while (currentXp >= nextLevelXp) {
      currentXp -= nextLevelXp;
      level += 1;
      nextLevelXp = getXpRequiredForLevel(level);
    }
  } else if (xpDelta < 0) {
    if (currentXp < 0) {
      currentXp = 0;
    }
  }

  return {
    level,
    currentXp,
    nextLevelXp,
    totalPoints: newPoints,
    momentumPoints: newPoints,
    leveledUp: level > initialLevel,
  };
}
