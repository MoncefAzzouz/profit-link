import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/finance/dashboard (Affiliate dashboard statistics)
router.get('/dashboard', authenticateToken, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get all orders for this affiliate
    const orders = await prisma.order.findMany({
      where: { affiliateId: userId }
    });

    const totalOrders = orders.length;
    
    // Count confirmed orders (CONFIRMED, SHIPPED, DELIVERED)
    const confirmedOrders = orders.filter(o => 
      ['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(o.status)
    ).length;

    const confirmationRate = totalOrders > 0 
      ? Math.round((confirmedOrders / totalOrders) * 100) 
      : 0;

    // Pending Earnings (PENDING, CONFIRMED, SHIPPED)
    const pendingEarnings = orders
      .filter(o => ['PENDING', 'CONFIRMED', 'SHIPPED'].includes(o.status))
      .reduce((sum, o) => sum + o.commissionAmount, 0);

    // Total Earnings (DELIVERED) - Or we can use the user's walletBalance plus withdrawn.
    // For now, based on the agreed logic:
    const totalEarnings = orders
      .filter(o => o.status === 'DELIVERED')
      .reduce((sum, o) => sum + o.commissionAmount, 0);

    res.json({
      totalOrders,
      confirmedOrders,
      confirmationRate,
      pendingEarnings,
      totalEarnings
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

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
