import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/products (List all products — public for affiliates)
router.get('/', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { isVisible: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ data: products });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/all (Admin: List ALL products including hidden)
router.get('/all', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ data: products });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/products (Admin: Create new product)
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { name, description, adText, price, originalPrice, commission, category, images, image, videoUrl, stock, isVisible, isTrend, isFeatured, features } = req.body;

    if (!name || !price || !commission || !category) {
      return res.status(400).json({ error: 'Missing required product fields (name, price, commission, category)' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || "",
        adText: adText || null,
        price: parseFloat(price),
        originalPrice: parseFloat(originalPrice) || 0,
        commission: parseFloat(commission),
        category,
        images: images || [],
        image: image || null,
        videoUrl: videoUrl || null,
        stock: parseInt(stock) || 0,
        isVisible: isVisible !== undefined ? isVisible : true,
        isTrend: isTrend || false,
        isFeatured: isFeatured || false,
        features: features || []
      }
    });

    res.status(201).json({ message: 'Product created successfully', data: product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id (Admin: Update product)
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, description, adText, price, originalPrice, commission, category, images, image, videoUrl, stock, isVisible, isTrend, isFeatured, features, status } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(adText !== undefined && { adText }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(originalPrice !== undefined && { originalPrice: parseFloat(originalPrice) }),
        ...(commission !== undefined && { commission: parseFloat(commission) }),
        ...(category !== undefined && { category }),
        ...(images !== undefined && { images }),
        ...(image !== undefined && { image }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(isVisible !== undefined && { isVisible }),
        ...(isTrend !== undefined && { isTrend }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(features !== undefined && { features }),
        ...(status !== undefined && { status }),
      }
    });

    res.json({ message: 'Product updated successfully', data: product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id (Admin: Delete product)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
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
