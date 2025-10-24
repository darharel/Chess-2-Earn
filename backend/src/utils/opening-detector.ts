import { CHESS_OPENINGS } from './openings.js';

function normalizeMoves(moves: string): string[] {
  return moves
    .replace(/\{[^}]+}/g, ' ')
    .replace(/\d+\.|\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((move) => move.trim().toLowerCase())
    .filter(Boolean);
}

export function detectOpeningFromPgn(pgn: string): string | undefined {
  const normalizedMoves = normalizeMoves(pgn);

  if (normalizedMoves.length === 0) {
    return undefined;
  }

  const matchingOpening = CHESS_OPENINGS.reduce<{ id?: string; moveCount: number }>((best, opening) => {
    const openingMoves = normalizeMoves(opening.moves);
    const isMatch = openingMoves.every((move, index) => normalizedMoves[index] === move);

    if (!isMatch) {
      return best;
    }

    if (!best.id || openingMoves.length > best.moveCount) {
      return { id: opening.id, moveCount: openingMoves.length };
    }

    return best;
  }, { id: undefined, moveCount: 0 });

  return matchingOpening.id;
}
