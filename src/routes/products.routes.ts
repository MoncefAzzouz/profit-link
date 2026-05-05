import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Fields needed by the products listing / quick-view UI. Heavy detail-only
// fields (adText, videoUrl, features, variant arrays, before/after, wholesale
// pricing) are loaded by the product detail endpoint instead.
const productListSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  originalPrice: true,
  commission: true,
  images: true,
  image: true,
  category: true,
  stock: true,
  status: true,
  isVisible: true,
  isTrend: true,
  isFeatured: true,
  createdAt: true,
} as const;

// GET /api/products (List products — public for affiliates)
// Optional: ?page=1&limit=24 enables server pagination. Without them, returns
// all visible products (legacy behaviour) so the existing client keeps working.
router.get('/', async (req: Request, res: Response) => {
  try {
    const pageParam = req.query.page ? parseInt(String(req.query.page), 10) : null;
    const limitParam = req.query.limit ? parseInt(String(req.query.limit), 10) : null;
    const paginated = pageParam !== null || limitParam !== null;

    const where = { isVisible: true } as const;
    const orderBy = { createdAt: 'desc' as const };

    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');

    if (paginated) {
      const page = Math.max(1, pageParam ?? 1);
      const limit = Math.min(100, Math.max(1, limitParam ?? 24));
      const [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          orderBy,
          select: productListSelect,
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);
      return res.json({
        data: products,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      });
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      select: productListSelect,
    });
    res.json({ data: products });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ==================== CATEGORIES ====================

// GET /api/products/categories (Public: list active categories)
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' }
    });
    res.json({ data: categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/products/categories/all (Admin: list all categories)
router.get('/categories/all', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'asc' }
    });
    res.json({ data: categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/products/categories (Admin: create category)
router.post('/categories', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { name, icon, isActive } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const category = await prisma.category.create({
      data: { name, icon: icon || "📦", isActive: isActive ?? true }
    });
    res.status(201).json({ data: category });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT /api/products/categories/:id (Admin: update category)
router.put('/categories/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, icon, isActive } = req.body;
    
    const category = await prisma.category.update({
      where: { id: id as string },
      data: {
        ...(name !== undefined && { name }),
        ...(icon !== undefined && { icon }),
        ...(isActive !== undefined && { isActive })
      }
    });
    res.json({ data: category });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /api/products/categories/:id (Admin: delete category)
router.delete('/categories/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id: id as string } });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ==================== PRODUCTS ====================

// GET /api/products/all (Admin: List ALL products including hidden)
router.get('/all', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const pageParam = req.query.page ? parseInt(String(req.query.page), 10) : null;
    const limitParam = req.query.limit ? parseInt(String(req.query.limit), 10) : null;
    const paginated = pageParam !== null || limitParam !== null;
    const orderBy = { createdAt: 'desc' as const };

    res.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30');

    if (paginated) {
      const page = Math.max(1, pageParam ?? 1);
      const limit = Math.min(100, Math.max(1, limitParam ?? 24));
      const [total, products] = await Promise.all([
        prisma.product.count(),
        prisma.product.findMany({
          orderBy,
          select: productListSelect,
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);
      return res.json({
        data: products,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      });
    }

    const products = await prisma.product.findMany({
      orderBy,
      select: productListSelect,
    });
    res.json({ data: products });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/products (Admin: Create new product)
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { name, description, adText, price, originalPrice, commission, category, images, videoUrl, stock, isVisible, isTrend, isFeatured, features, wholesalePrice, affiliatePrice, hasColors, availableColors, hasSizes, availableSizes, showFreeShipping, hasBeforeAfter, beforeImage, afterImage } = req.body;
    const image: string | undefined = req.body.image;

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
        image: (image as string) || null,
        videoUrl: videoUrl || null,
        stock: parseInt(stock) || 0,
        isVisible: isVisible !== undefined ? isVisible : true,
        isTrend: isTrend || false,
        isFeatured: isFeatured || false,
        features: features || [],
        wholesalePrice: parseFloat(wholesalePrice) || 0,
        affiliatePrice: parseFloat(affiliatePrice) || 0,
        hasColors: hasColors || false,
        availableColors: availableColors || [],
        hasSizes: hasSizes || false,
        availableSizes: availableSizes || [],
        showFreeShipping: showFreeShipping || false,
        hasBeforeAfter: hasBeforeAfter || false,
        beforeImage: beforeImage || null,
        afterImage: afterImage || null
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
    const { name, description, adText, price, originalPrice, commission, category, images, videoUrl, stock, isVisible, isTrend, isFeatured, features, status, wholesalePrice, affiliatePrice, hasColors, availableColors, hasSizes, availableSizes, showFreeShipping, hasBeforeAfter, beforeImage, afterImage } = req.body;
    const image: string | undefined = req.body.image;

    const product = await prisma.product.update({
      where: { id: id as string },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(adText !== undefined && { adText }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(originalPrice !== undefined && { originalPrice: parseFloat(originalPrice) }),
        ...(commission !== undefined && { commission: parseFloat(commission) }),
        ...(category !== undefined && { category }),
        ...(images !== undefined && { images }),
        ...(image !== undefined && { image: image as string }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(isVisible !== undefined && { isVisible }),
        ...(isTrend !== undefined && { isTrend }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(features !== undefined && { features }),
        ...(status !== undefined && { status }),
        ...(wholesalePrice !== undefined && { wholesalePrice: parseFloat(wholesalePrice) }),
        ...(affiliatePrice !== undefined && { affiliatePrice: parseFloat(affiliatePrice) }),
        ...(hasColors !== undefined && { hasColors }),
        ...(availableColors !== undefined && { availableColors }),
        ...(hasSizes !== undefined && { hasSizes }),
        ...(availableSizes !== undefined && { availableSizes }),
        ...(showFreeShipping !== undefined && { showFreeShipping }),
        ...(hasBeforeAfter !== undefined && { hasBeforeAfter }),
        ...(beforeImage !== undefined && { beforeImage }),
        ...(afterImage !== undefined && { afterImage }),
      }
    });

    // Sync essential product details to ALL existing landing pages for this product
    // This ensures that when the admin updates a product, those changes reflect on all affiliate landing pages
    const landingPages = await prisma.landingPage.findMany({ where: { productId: id as string } });
    
    if (landingPages.length > 0) {
      const updatePromises = landingPages.map(lp => {
        const config = lp.pageConfig as any;
        const updatedConfig = {
          ...config,
          productName: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          category: product.category,
          heroSubtitle: product.description || config.heroSubtitle,
          availableColors: product.hasColors ? product.availableColors : [],
          availableSizes: product.hasSizes ? product.availableSizes : [],
          showFreeShipping: product.showFreeShipping,
          beforeAfterImages: product.hasBeforeAfter ? { before: product.beforeImage, after: product.afterImage } : config.beforeAfterImages,
        };
        return prisma.landingPage.update({
          where: { id: lp.id },
          data: { pageConfig: updatedConfig }
        });
      });
      
      await Promise.all(updatePromises);
    }

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
    await prisma.product.delete({ where: { id: id as string } });
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
