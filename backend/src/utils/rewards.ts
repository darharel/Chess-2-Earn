export interface Rewards {
  gems: number;
  knowledgePoints: number;
}

export function calculateRewards(result: 'win' | 'loss' | 'draw'): Rewards {
  switch (result) {
    case 'win':
      return { gems: 50, knowledgePoints: 30 };
    case 'draw':
      return { gems: 25, knowledgePoints: 20 };
    case 'loss':
    default:
      return { gems: 10, knowledgePoints: 10 };
  }
}
