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
router.post('/withdraw', authenticateToken, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { amount, method, accountDetails } = req.body;
    const requestedAmount = parseFloat(amount);

    if (!requestedAmount || requestedAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // SECURITY CHECK: Calculate real withdrawable balance
    // 1. Sum of all DELIVERED commissions
    const deliveredOrders = await prisma.order.findMany({
      where: { affiliateId: userId, status: 'DELIVERED' }
    });
    const totalDeliveredCommissions = deliveredOrders.reduce((sum, o) => sum + o.commissionAmount, 0);

    // 2. Sum of all previous withdrawal requests
    const pastWithdrawals = await prisma.withdrawalRequest.findMany({
      where: { userId }
    });
    const totalWithdrawnOrPending = pastWithdrawals.reduce((sum, w) => sum + w.amount, 0);

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
