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

export default router;
