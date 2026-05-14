import { Router, Request, Response } from 'express';
import { EcotrackService } from '../services/ecotrack.service';
import { authenticateToken, AuthRequest, requireAdmin } from '../middleware/auth';
import { prisma } from '../db';

const router = Router();

// POST /api/orders (Public: Triggered by Landing Page checkout)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { 
      productId, affiliateId, customerName, customerPhone, 
      wilaya, address, quantity, totalAmount, commissionAmount,
      commune, shippingFee, stopDesk, selectedColor, selectedSize, selectedOffer
    } = req.body;

    const missing = [];
    if (!productId) missing.push('productId');
    if (!affiliateId) missing.push('affiliateId');
    if (!customerName) missing.push('customerName');
    if (!customerPhone) missing.push('customerPhone');
    if (!wilaya) missing.push('wilaya');

    if (missing.length > 0) {
      console.error('❌ Missing fields:', missing);
      return res.status(400).json({ 
        error: 'Missing required order fields', 
        missingFields: missing 
      });
    }

    console.log(`📦 Creating order for Product: ${productId}, Affiliate: ${affiliateId}`);

    // Verify Product and Affiliate exist
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      console.error(`❌ Order failed: Product ${productId} not found in DB`);
      return res.status(404).json({ error: `Product ${productId} not found` });
    }

    let affiliate = await prisma.user.findUnique({ where: { id: affiliateId } });
    
    // AUTO-HELP: If this is a demo/testing affiliate and doesn't exist, create it to avoid FK errors
    if (!affiliate && affiliateId.startsWith('aff-')) {
      console.log(`📝 Creating dummy affiliate for testing: ${affiliateId}`);
      affiliate = await prisma.user.create({
        data: {
          id: affiliateId,
          email: `${affiliateId}@example.com`,
          passwordHash: 'dummy_hash',
          name: "Demo Affiliate",
          role: "AFFILIATE"
        }
      });
    }

    if (!affiliate) {
      console.error(`❌ Order failed: Affiliate ${affiliateId} not found in DB`);
      return res.status(404).json({ error: `Affiliate ${affiliateId} not found. Please use your real ID from the dashboard.` });
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
        totalAmount: parseFloat(String(totalAmount)),
        commissionAmount: parseFloat(String(commissionAmount || product.commission || 0)),
        commune: commune || "",
        shippingFee: parseFloat(String(shippingFee || 0)),
        stopDesk: parseInt(String(stopDesk || 0)),
        selectedColor: selectedColor || null,
        selectedSize: selectedSize || null,
        selectedOffer: selectedOffer || null
      }
    });

    console.log(`✅ Order created successfully: ${order.id}`);

    res.status(201).json({ 
      message: 'Order submitted successfully', 
      data: order,
      tracking: null
    });
  } catch (error) {
    console.error('❌ POST /api/orders error:', error);
    res.status(500).json({ error: 'Failed to process checkout', details: String(error) });
  }
});

// GET /api/orders/affiliate (Affiliate sees their own generated orders)
router.get('/affiliate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const affiliateId = req.user?.userId;
    console.log(`🔍 Fetching orders for affiliate: ${affiliateId}`);
    if (!affiliateId) return res.status(401).json({ error: 'Unauthorized' });

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { affiliateId },
        include: { product: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where: { affiliateId } })
    ]);

    res.json({ 
      data: orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch affiliate orders' });
  }
});

// GET /api/orders/all (Admin sees everything)
router.get('/all', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        include: { product: true, affiliate: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count()
    ]);

    res.json({ 
      data: orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
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

// POST /api/orders/:id/push-ecotrack (Seller/Admin pushes order to Ecotrack)
router.post('/:id/push-ecotrack', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const order = (await prisma.order.findUnique({
      where: { id: id as string },
      include: { product: true }
    })) as any;

    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Prepare ECOTRACK data
    const ecotrackData = {
      reference: order.id,
      nom_client: order.customerName,
      telephone: order.customerPhone,
      adresse: order.address,
      code_wilaya: parseInt(String(order.wilaya), 10),
      commune: order.commune,
      montant: order.totalAmount,
      produit: `${order.product.name}${order.selectedOffer ? ' - ' + order.selectedOffer : ''}${order.selectedColor ? ' - ' + order.selectedColor : ''}${order.selectedSize ? ' - ' + order.selectedSize : ''}`,
      quantite: parseInt(String(order.quantity), 10),
      stop_desk: parseInt(String(order.stopDesk), 10),
      type: 1 // 1 = Livraison, as per Ecotrack docs
    };

    const response = await EcotrackService.createOrder(ecotrackData);

    if (response.success && response.tracking) {
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { 
          trackingNumber: response.tracking,
          status: 'SHIPPED' // Or a specific Ecotrack-linked status
        }
      });
      return res.json({ message: 'Order sent to Ecotrack', tracking: response.tracking, data: updatedOrder });
    } else {
      return res.status(400).json({ error: 'Ecotrack API reported failure', details: response });
    }
  } catch (error) {
    console.error('Push to Ecotrack failed:', error);
    res.status(500).json({ error: 'Failed to push order to Ecotrack' });
  }
});

// GET /api/orders/:id/tracking (Get real-time tracking status from Ecotrack)
router.get('/:id/tracking', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const order = await prisma.order.findUnique({ where: { id: id as string } });

    if (!order || !order.trackingNumber) {
      return res.status(404).json({ error: 'Order tracking info not found' });
    }

    const trackingInfo = await EcotrackService.getTrackingInfo(order.trackingNumber);
    res.json({ data: trackingInfo });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tracking data' });
  }
});

// POST /api/orders/:id/validate (Expedite order to Ecotrack)
router.post('/:id/validate', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { askCollection } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: id as string }
    });

    if (!order || !order.trackingNumber) {
      return res.status(404).json({ error: 'Order not found or missing tracking number' });
    }

    const response = await EcotrackService.validateOrder(order.trackingNumber, askCollection !== false);

    if (response.success) {
      // Update local status to reflect it's now truly dispatched/validated
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'SHIPPED' } // You might want a 'VALIDATED' status later
      });
      return res.json({ message: 'Order validated/expedited successfully', data: response });
    } else {
      return res.status(400).json({ error: 'Ecotrack validation failed', details: response });
    }
  } catch (error) {
    console.error('❌ POST /api/orders/:id/validate error:', error);
    res.status(500).json({ error: 'Failed to validate order' });
  }
});

export default router;
