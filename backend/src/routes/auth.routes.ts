import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Register logic not implemented yet.' });
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Login logic not implemented yet.' });
});

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Get Me logic not implemented yet.' });
});

export default router;
