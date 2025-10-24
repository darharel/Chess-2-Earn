import { z } from 'zod';

export const submitGameSchema = z.object({
  gameUuid: z.string().min(1),
  pgn: z.string().min(1),
  result: z.enum(['win', 'loss', 'draw']),
  openingId: z.string().min(1).max(100).optional(),
  chessComUsername: z.string().min(3).max(50).optional()
});

export const historyQuerySchema = z.object({
  limit: z.string().optional(),
  offset: z.string().optional(),
  opening: z.string().optional()
});
