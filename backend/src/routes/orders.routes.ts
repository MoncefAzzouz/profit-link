import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/orders (Public: Triggered by Landing Page checkout)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { productId, affiliateId, customerName, customerPhone, wilaya, address, quantity, totalAmount, commissionAmount } = req.body;

    if (!productId || !affiliateId || !customerName || !customerPhone || !wilaya) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }

    const order = await prisma.order.create({
      data: {
        productId,
        affiliateId,
        customerName,
        customerPhone,
        wilaya,
        address: address || "",
        quantity: quantity || 1,
        totalAmount: parseFloat(totalAmount),
        commissionAmount: parseFloat(commissionAmount)
      }
    });

    res.status(201).json({ message: 'Order submitted successfully', data: order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process checkout' });
  }
});

// GET /api/orders/affiliate (Affiliate sees their own generated orders)
router.get('/affiliate', async (req: Request, res: Response) => {
  try {
    const affiliateId = req.header('x-user-id');
    if (!affiliateId) return res.status(401).json({ error: 'Missing auth header' });

    const orders = await prisma.order.findMany({
      where: { affiliateId },
      include: { product: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ data: orders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch affiliate orders' });
  }
});

// GET /api/orders/all (Admin sees everything)
router.get('/all', async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: { product: true, affiliate: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ data: orders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch system orders' });
  }
});

// PATCH /api/orders/:id/status (Admin/System updates order status)
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { status, trackingNumber } = req.body;

    const updatedOrder = await prisma.order.update({
      where: { id: id as string },
      data: { 
        status, 
        ...(trackingNumber && { trackingNumber }) 
      }
    });

    res.json({ message: 'Order status updated', data: updatedOrder });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

export default router;
