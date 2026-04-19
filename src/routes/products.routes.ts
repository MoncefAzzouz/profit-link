import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/products (List all products for Affiliates)
router.get('/', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ data: products });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/products (Admin Only: Create new product)
router.post('/', async (req: Request, res: Response) => {
  try {
    // Basic Admin authorization check mockup
    const userId = req.header('x-user-id');
    
    // Validate required fields
    const { name, description, price, originalPrice, commission, category, images, stock } = req.body;
    if (!name || !price || !commission || !category) {
      return res.status(400).json({ error: 'Missing required product fields' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || "",
        price: parseFloat(price),
        originalPrice: parseFloat(originalPrice),
        commission: parseFloat(commission),
        category,
        images: images || [],
        stock: parseInt(stock) || 0
      }
    });

    res.status(201).json({ message: 'Product successfully added to inventory', data: product });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// GET /api/products/:id (Get single product)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const product = await prisma.product.findUnique({
      where: { id: id as string }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ data: product });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch specific product' });
  }
});

export default router;
