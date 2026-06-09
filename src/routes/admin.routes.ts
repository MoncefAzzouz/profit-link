import { Router, Response } from 'express';
import { authenticateToken, AuthRequest, requireAdmin } from '../middleware/auth';
import { prisma } from '../db';
import { withCache } from '../services/cache';

const router = Router();

// GET /api/admin/dashboard (Admin overview statistics)
router.get('/dashboard', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    // Admin overview is the same for every admin (global), so cache it server-side
    // for a few seconds — the heavy groupBy/aggregate over the whole Order table
    // shouldn't re-run on every page view. Invalidated on order writes.
    const payload = await withCache('admin:dashboard', 10_000, async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [agg, confirmedOrders, totalAffiliates, distinctAffiliateRows, ordersThisMonth] = await Promise.all([
        prisma.order.aggregate({
          _sum: { totalAmount: true },
          _count: { id: true },
        }),
        prisma.order.count({
          where: { status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] } },
        }),
        prisma.user.count({ where: { role: 'AFFILIATE' } }),
        prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(DISTINCT "affiliateId")::bigint AS count FROM "Order"`,
        prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      ]);

      const totalRevenue = agg._sum.totalAmount || 0;
      const totalOrders = agg._count.id;
      const confirmationRate = totalOrders > 0
        ? Math.round((confirmedOrders / totalOrders) * 100)
        : 0;
      const activeAffiliates = Number(distinctAffiliateRows[0]?.count ?? 0);

      return { totalRevenue, totalOrders, confirmationRate, totalAffiliates, activeAffiliates, ordersThisMonth };
    });

    res.set('Cache-Control', 'private, no-store');
    res.json(payload);
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
      where: { id: id as string },
      data: { status: status as any }
    });

    res.json({ message: `Withdrawal ${status} successfully`, data: withdrawal });
  } catch (error) {
    console.error('Error updating withdrawal:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/admin/affiliates (List all affiliates with stats)
router.get('/affiliates', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    // Global (same for every admin) → cache server-side; invalidated on order writes.
    const formatted = await withCache('admin:affiliates', 15_000, async () => {
      // Aggregate per-affiliate stats DB-side (one query) instead of loading every order.
      const [affiliates, statusCounts, deliveredSums] = await Promise.all([
        prisma.user.findMany({
          where: { role: 'AFFILIATE' },
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            storeName: true,
          },
        }),
        prisma.order.groupBy({
          by: ['affiliateId', 'status'],
          _count: { _all: true },
        }),
        prisma.order.groupBy({
          by: ['affiliateId'],
          where: { status: 'DELIVERED' },
          _sum: { commissionAmount: true },
        }),
      ]);

      const totalsByAffiliate = new Map<string, { total: number; confirmed: number }>();
      for (const row of statusCounts) {
        const cur = totalsByAffiliate.get(row.affiliateId) ?? { total: 0, confirmed: 0 };
        cur.total += row._count._all;
        if (row.status === 'CONFIRMED' || row.status === 'SHIPPED' || row.status === 'DELIVERED') {
          cur.confirmed += row._count._all;
        }
        totalsByAffiliate.set(row.affiliateId, cur);
      }

      const earningsByAffiliate = new Map<string, number>();
      for (const row of deliveredSums) {
        earningsByAffiliate.set(row.affiliateId, row._sum.commissionAmount ?? 0);
      }

      return affiliates.map(a => {
        const t = totalsByAffiliate.get(a.id) ?? { total: 0, confirmed: 0 };
        const earnings = earningsByAffiliate.get(a.id) ?? 0;
        const confirmationRate = t.total > 0 ? Math.round((t.confirmed / t.total) * 100) : 0;
        return {
          id: a.id,
          name: a.name,
          email: a.email,
          storeName: a.storeName,
          createdAt: a.createdAt,
          totalOrders: t.total,
          confirmedOrders: t.confirmed,
          earnings,
          confirmationRate,
          status: 'active'
        };
      });
    });

    res.set('Cache-Control', 'private, no-store');
    res.json({ data: formatted });
  } catch (error) {
    console.error('Error fetching admin affiliates:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/admin/join-requests (Pending sign-ups awaiting approval, with quiz answers)
router.get('/join-requests', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const status = (req.query.status as string)?.toUpperCase();
    const where = status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)
      ? { status: status as any }
      : { status: 'PENDING' as any };

    const users = await prisma.user.findMany({
      where: { ...where, role: 'AFFILIATE' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        wilaya: true,
        storeName: true,
        ccp: true,
        status: true,
        questionnaire: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: users });
  } catch (error) {
    console.error('Error fetching join requests:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PATCH /api/admin/join-requests/:id (Approve or reject a pending sign-up)
router.patch('/join-requests/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'APPROVED' or 'REJECTED'

    const next = String(status || '').toUpperCase();
    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(next)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const user = await prisma.user.update({
      where: { id: id as string },
      data: { status: next as any },
      select: { id: true, name: true, email: true, status: true },
    });

    res.json({ message: `Join request ${next.toLowerCase()}`, data: user });
  } catch (error) {
    console.error('Error updating join request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
