export type GameResult = 'win' | 'loss' | 'draw';

export interface Rewards {
  /** Total gems granted for the game. */
  gems: number;
  /** Total knowledge points granted for the game. */
  knowledgePoints: number;
  /** Breakdown of how the totals were derived. */
  breakdown: {
    baseGems: number;
    baseKnowledgePoints: number;
    streakBonusGems: number;
    streakBonusKnowledgePoints: number;
  };
}

const BASE_REWARD_TABLE: Record<GameResult, { gems: number; knowledgePoints: number }> = {
  win: { gems: 50, knowledgePoints: 30 },
  draw: { gems: 25, knowledgePoints: 20 },
  loss: { gems: 10, knowledgePoints: 10 }
};

const STREAK_GEM_BONUS = 5;
const MAX_STREAK_GEM_BONUS = 40;

export function calculateRewards(result: GameResult, currentWinStreak = 0): Rewards {
  const base = BASE_REWARD_TABLE[result];
  const eligibleStreak = result === 'win' ? currentWinStreak : 0;
  const streakBonusGems = Math.min(eligibleStreak * STREAK_GEM_BONUS, MAX_STREAK_GEM_BONUS);
  const streakBonusKnowledgePoints = Math.floor(streakBonusGems / 2);

  return {
    gems: base.gems + streakBonusGems,
    knowledgePoints: base.knowledgePoints + streakBonusKnowledgePoints,
    breakdown: {
      baseGems: base.gems,
      baseKnowledgePoints: base.knowledgePoints,
      streakBonusGems,
      streakBonusKnowledgePoints
    }
  };
}
