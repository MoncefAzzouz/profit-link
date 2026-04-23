import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/admin/dashboard (Admin overview statistics)
router.get('/dashboard', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    // Total revenue (sum of all order amounts)
    const allOrders = await prisma.order.findMany();
    const totalRevenue = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = allOrders.length;

    // Confirmation rate
    const confirmedOrders = allOrders.filter(o =>
      ['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(o.status)
    ).length;
    const confirmationRate = totalOrders > 0
      ? Math.round((confirmedOrders / totalOrders) * 100)
      : 0;

    // Active affiliates (users with role AFFILIATE)
    const totalAffiliates = await prisma.user.count({ where: { role: 'AFFILIATE' } });

    // "Active" = affiliates who have at least 1 order
    const affiliatesWithOrders = await prisma.order.groupBy({
      by: ['affiliateId'],
    });
    const activeAffiliates = affiliatesWithOrders.length;

    // Orders this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const ordersThisMonth = allOrders.filter(o => new Date(o.createdAt) >= startOfMonth).length;

    res.json({
      totalRevenue,
      totalOrders,
      confirmationRate,
      totalAffiliates,
      activeAffiliates,
      ordersThisMonth,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/admin/withdrawals (Admin sees all payout requests)
router.get('/withdrawals', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const withdrawals = await prisma.withdrawalRequest.findMany({
      include: {
        user: {
          select: {
            name: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Map to a cleaner format for the frontend
    const formatted = withdrawals.map(w => ({
      id: w.id,
      amount: w.amount,
      method: w.method,
      accountDetails: w.accountDetails,
      status: w.status,
      createdAt: w.createdAt,
      requesterName: w.user.name,
      requesterRole: w.user.role
    }));

    res.json({ data: formatted });
  } catch (error) {
    console.error('Error fetching admin withdrawals:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PATCH /api/admin/withdrawals/:id (Admin approves/rejects payout)
router.patch('/withdrawals/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const withdrawal = await prisma.withdrawalRequest.update({
      where: { id },
      data: { status }
    });

    res.json({ message: `Withdrawal ${status} successfully`, data: withdrawal });
  } catch (error) {
    console.error('Error updating withdrawal:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
