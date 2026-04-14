import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/finance/withdraw (Affiliate requests payout)
router.post('/withdraw', async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Request withdrawal not implemented.' });
});

// GET /api/finance/withdraw (View withdrawal history)
router.get('/withdraw', async (req: Request, res: Response) => {
  res.status(501).json({ message: 'View withdrawals not implemented.' });
});

// PATCH /api/finance/withdraw/approve (Admin approves/rejects payout)
router.patch('/withdraw/approve', async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Process withdrawal not implemented.' });
});

export default router;
