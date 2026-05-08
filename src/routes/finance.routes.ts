import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../db';

const router = Router();

// GET /api/finance/dashboard (Affiliate dashboard statistics)
router.get('/dashboard', authenticateToken, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Aggregate counts/sums DB-side instead of pulling every order into memory.
    const [totalOrders, confirmedOrders, pendingAgg, deliveredAgg] = await Promise.all([
      prisma.order.count({ where: { affiliateId: userId } }),
      prisma.order.count({
        where: { affiliateId: userId, status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] } },
      }),
      prisma.order.aggregate({
        where: { affiliateId: userId, status: { in: ['PENDING', 'CONFIRMED', 'SHIPPED'] } },
        _sum: { commissionAmount: true },
      }),
      prisma.order.aggregate({
        where: { affiliateId: userId, status: 'DELIVERED' },
        _sum: { commissionAmount: true },
      }),
    ]);

    const confirmationRate = totalOrders > 0
      ? Math.round((confirmedOrders / totalOrders) * 100)
      : 0;
    const pendingEarnings = pendingAgg._sum.commissionAmount ?? 0;
    const totalEarnings = deliveredAgg._sum.commissionAmount ?? 0;

    res.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30');
    res.json({
      totalOrders,
      confirmedOrders,
      confirmationRate,
      pendingEarnings,
      totalEarnings,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// POST /api/finance/withdraw (Affiliate requests payout)
router.post('/withdraw', authenticateToken, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { amount, method, accountDetails } = req.body;
    const requestedAmount = parseFloat(amount);

    if (!requestedAmount || requestedAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // SECURITY CHECK: Calculate real withdrawable balance via DB-side aggregation.
    const [deliveredAgg, withdrawnAgg] = await Promise.all([
      prisma.order.aggregate({
        where: { affiliateId: userId, status: 'DELIVERED' },
        _sum: { commissionAmount: true },
      }),
      prisma.withdrawalRequest.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
    ]);
    const totalDeliveredCommissions = deliveredAgg._sum.commissionAmount ?? 0;
    const totalWithdrawnOrPending = withdrawnAgg._sum.amount ?? 0;

    const withdrawableBalance = totalDeliveredCommissions - totalWithdrawnOrPending;

    if (requestedAmount > withdrawableBalance) {
      return res.status(400).json({ 
        error: 'Insufficient funds. Amount exceeds withdrawable balance.',
        withdrawableBalance
      });
    }

    const withdrawal = await prisma.withdrawalRequest.create({
      data: {
        userId,
        amount: requestedAmount,
        method,
        accountDetails,
        status: 'pending'
      }
    });

    res.status(201).json({ message: 'Withdrawal requested successfully', data: withdrawal });
  } catch (error) {
    console.error('Error requesting withdrawal:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/finance/withdraw (View withdrawal history)
router.get('/withdraw', authenticateToken, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const withdrawals = await prisma.withdrawalRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ data: withdrawals });
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PATCH /api/finance/withdraw/approve (Admin approves/rejects payout)
router.patch('/withdraw/approve', async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Process withdrawal not implemented.' });
});

export default router;
