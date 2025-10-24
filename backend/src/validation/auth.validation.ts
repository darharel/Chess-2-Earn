import { z } from 'zod';

const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export const registerSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Username can contain letters, numbers, and underscores only'),
  email: z.string().email(),
  password: z.string().regex(passwordRegex, 'Password must be at least 8 characters with one uppercase letter and one number'),
  chessComUsername: z.string().min(3).max(50).optional()
});

export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8)
});
