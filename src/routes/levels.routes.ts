import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/levels - Public (for affiliates to see what's available)
router.get('/', async (req, res) => {
  try {
    const levels = await prisma.affiliateLevel.findMany({
      orderBy: { levelNumber: 'asc' }
    });
    res.json({ data: levels });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch levels' });
  }
});

// POST /api/levels - Admin only
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { name, levelNumber, targetOrders, reward, color } = req.body;
    const level = await prisma.affiliateLevel.create({
      data: { name, levelNumber, targetOrders, reward, color }
    });
    res.json({ message: 'Level created', data: level });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create level' });
  }
});

// PUT /api/levels/:id - Admin only
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, levelNumber, targetOrders, reward, color } = req.body;
    const level = await prisma.affiliateLevel.update({
      where: { id: id as string },
      data: { name, levelNumber, targetOrders, reward, color }
    });
    res.json({ message: 'Level updated', data: level });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update level' });
  }
});

// DELETE /api/levels/:id - Admin only
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    await prisma.affiliateLevel.delete({ where: { id: id as string } });
    res.json({ message: 'Level deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete level' });
  }
});

export default router;
