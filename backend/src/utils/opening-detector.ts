import { CHESS_OPENINGS } from './openings.js';

function normalizeMoves(moves: string): string[] {
  return moves
    .replace(/\d+\.|\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((move) => move.trim())
    .filter(Boolean);
}

export function detectOpeningFromPgn(pgn: string): string | undefined {
  const normalizedMoves = normalizeMoves(pgn);
  return CHESS_OPENINGS.find((opening) => {
    const openingMoves = normalizeMoves(opening.moves);
    return openingMoves.every((move, index) => normalizedMoves[index] === move);
  })?.id;
}
