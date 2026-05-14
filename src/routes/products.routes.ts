import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest, requireAdmin } from '../middleware/auth';
import { prisma } from '../db';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { cache, withCache } from '../services/cache';

const router = Router();

const PRODUCTS_CACHE_PREFIX = 'products:public:';
const CATEGORIES_CACHE_KEY = 'categories:public';
const PRODUCTS_TTL_MS = 60_000;
const CATEGORIES_TTL_MS = 5 * 60_000;

function invalidateProductCaches() {
  cache.invalidate(PRODUCTS_CACHE_PREFIX);
}
function invalidateCategoryCaches() {
  cache.invalidate('categories:');
}

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
  wholesalePrice: true,
  affiliatePrice: true,
  hasMarketingOffers: true,
  marketingOffers: true,
  hasLandingPage: true,
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
      const cacheKey = `${PRODUCTS_CACHE_PREFIX}p=${page}&l=${limit}`;
      const payload = await withCache(cacheKey, PRODUCTS_TTL_MS, async () => {
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
        return { data: products, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
      });
      return res.json(payload);
    }

    const products = await withCache(
      `${PRODUCTS_CACHE_PREFIX}all`,
      PRODUCTS_TTL_MS,
      () => prisma.product.findMany({ where, orderBy, select: productListSelect })
    );
    res.json({ data: products });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ==================== CATEGORIES ====================

// GET /api/products/categories (Public: list active categories)
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await withCache(
      CATEGORIES_CACHE_KEY,
      CATEGORIES_TTL_MS,
      () => prisma.category.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } })
    );
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
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
    invalidateCategoryCaches();
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
    invalidateCategoryCaches();
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
    invalidateCategoryCaches();
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
    const { name, description, adText, price, originalPrice, commission, category, images, videoUrl, stock, isVisible, isTrend, isFeatured, features, wholesalePrice, affiliatePrice, hasColors, availableColors, hasSizes, availableSizes, showFreeShipping, hasBeforeAfter, beforeImage, afterImage, hasMarketingOffers, marketingOffers, hasLandingPage } = req.body;
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
        afterImage: afterImage || null,
        hasMarketingOffers: hasMarketingOffers || false,
        marketingOffers: marketingOffers || [],
        hasLandingPage: hasLandingPage || false
      }
    });

    // Automatically create a default landing page for the admin if it doesn't exist
    try {
      const adminUserId = req.user?.userId;
      if (adminUserId) {
        const existingLP = await prisma.landingPage.findFirst({
          where: {
            ownerId: adminUserId,
            productId: product.id
          }
        });

        if (!existingLP) {
          await prisma.landingPage.create({
            data: {
              ownerId: adminUserId,
              productId: product.id,
              status: 'draft',
              pageConfig: {
                productName: product.name,
                template: "original",
                heroTitle: product.name,
                heroSubtitle: product.description || "أفضل جودة بأفضل سعر في السوق الجزائري",
                price: product.price,
                originalPrice: product.originalPrice,
                category: product.category,
                heroImage: product.image,
                galleryImages: product.images,
                features: product.features.length > 0 ? product.features : ["جودة عالية مضمونة", "توصيل سريع لكل الولايات", "الدفع عند الاستلام", "ضمان الاستبدال والاسترجاع"],
                sections: product.hasBeforeAfter 
                  ? ["hero", "urgency-bar", "before-after", "features", "gallery", "social-proof", "reviews", "shipping", "cta"]
                  : ["hero", "urgency-bar", "features", "gallery", "social-proof", "reviews", "shipping", "cta"],
                primaryColor: "#10b981",
                accentColor: "#3b82f6",
                ctaText: "اطلب الآن",
                fontFamily: "cairo",
                backgroundColor: "#ffffff"
              }
            }
          });
        }
      }
    } catch (lpError) {
      console.error('Failed to auto-create landing page for admin:', lpError);
    }

    invalidateProductCaches();
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
    const { name, description, adText, price, originalPrice, commission, category, images, videoUrl, stock, isVisible, isTrend, isFeatured, features, status, wholesalePrice, affiliatePrice, hasColors, availableColors, hasSizes, availableSizes, showFreeShipping, hasBeforeAfter, beforeImage, afterImage, hasMarketingOffers, marketingOffers, hasLandingPage } = req.body;
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
        ...(hasMarketingOffers !== undefined && { hasMarketingOffers }),
        ...(marketingOffers !== undefined && { marketingOffers }),
        ...(hasLandingPage !== undefined && { hasLandingPage })
      }
    });

    // Sync essential product details to ALL existing landing pages for this product.
    // Each row's pageConfig is JSON-merged individually, so we can't use updateMany —
    // but we run all updates in a single transaction for atomicity and one round-trip.
    const landingPages = await prisma.landingPage.findMany({
      where: { productId: id as string },
      select: { id: true, pageConfig: true },
    });

    if (landingPages.length > 0) {
      const updates = landingPages.map(lp => {
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
          data: { pageConfig: updatedConfig },
        });
      });
      await prisma.$transaction(updates);
    }

    invalidateProductCaches();
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
    invalidateProductCaches();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// PUT /api/products/:id/toggle-landing-page (Admin: Toggle landing page visibility)
router.put('/:id/toggle-landing-page', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { hasLandingPage } = req.body;
    
    if (typeof hasLandingPage !== 'boolean') {
      return res.status(400).json({ error: 'hasLandingPage must be a boolean' });
    }

    const product = await prisma.product.update({
      where: { id: id as string },
      data: { hasLandingPage },
      select: { id: true, hasLandingPage: true }
    });

    invalidateProductCaches();
    res.json({ message: 'Product landing page status updated', data: product });
  } catch (error) {
    console.error('Error toggling landing page status:', error);
    res.status(500).json({ error: 'Failed to update landing page status' });
  }
});

// GET /api/products/:id (Get single product)
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id;
    const product = await prisma.product.findUnique({
      where: { id: id as string }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    res.json({ data: product });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch specific product' });
  }
});

// POST /api/products/:id/generate-ai-landing-page (Admin: Generate AI Landing Page from Product Data)
router.post('/:id/generate-ai-landing-page', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const adminUserId = req.user?.userId;
    if (!adminUserId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: String(id) }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing from backend' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Prepare context
    const contextText = `
      Product Name: ${product.name}
      Description: ${product.description}
      Price: ${product.price}
      Original Price: ${product.originalPrice}
      Category: ${product.category}
      Features: ${product.features.join(', ')}
      Marketing Offers: ${product.hasMarketingOffers ? JSON.stringify(product.marketingOffers) : 'None'}
      Has Before/After Images: ${product.hasBeforeAfter ? 'Yes' : 'No'}
    `;

    const prompt = `
      You are an expert E-Commerce Copywriter and UI/UX Designer creating high-converting landing pages for the Algerian market in Arabic.
      Analyze the provided product details: "${contextText}".
      
      Generate a STUNNING landing page configuration for this specific product. Your response must be an expert-level blueprint.
      
      Respond ONLY with a valid JSON object matching this exact structure, with no markdown code blocks around it:
      {
        "productName": "${product.name}",
        "template": "modern", // pick best fit: luxury, modern, bold, dark, neon, tiktok, instagram, flash-sale
        "category": "${product.category}",
        "price": ${product.price},
        "originalPrice": ${product.originalPrice},
        "primaryColor": "#HEX_COLOR", // Pick a strong, attractive color
        "accentColor": "#HEX_COLOR", // A complementary accent color
        "backgroundColor": "#F8F9FA", // A clean background color
        "heroTitle": "Extremely catchy Arabic title about ${product.name}",
        "heroSubtitle": "A persuasive Arabic hook highlighting benefits",
        "urgencyText": "Offer ends soon or limited stock (in Arabic)",
        "ctaText": "Buy Now (in Arabic)",
        "features": ["3 to 5 persuasive feature points in Arabic"],
        "sections": ["hero", "urgency-bar", "features", "gallery", "social-proof", "reviews", "shipping", "cta"] // add "before-after" if the product has before/after images
      }
      Make the colors modern and vibrant. The copy must be highly persuasive Algerian Arabic or standard Arabic.
    `;

    // Process image if available and is base64 data URL
    let result;
    if (product.image && product.image.startsWith('data:image/')) {
      const parts = product.image.split(',');
      const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const base64Data = parts[1];
      
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      };
      
      result = await model.generateContent([prompt, imagePart]);
    } else {
      result = await model.generateContent(prompt);
    }

    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const generatedConfig = JSON.parse(cleanJson);

    // Merge with explicitly required data to avoid Gemini hallucinating bad base values
    const finalConfig = {
      ...generatedConfig,
      productName: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      heroImage: product.image,
      galleryImages: product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []),
      availableColors: product.hasColors ? product.availableColors : [],
      availableSizes: product.hasSizes ? product.availableSizes : [],
      showFreeShipping: product.showFreeShipping,
      beforeAfterImages: product.hasBeforeAfter ? { before: product.beforeImage, after: product.afterImage } : { before: "", after: "" },
      hasMarketingOffers: product.hasMarketingOffers,
      marketingOffers: product.hasMarketingOffers ? product.marketingOffers : []
    };

    // Ensure 'before-after' is in sections if applicable, or remove it if not
    if (product.hasBeforeAfter && !finalConfig.sections.includes("before-after")) {
      finalConfig.sections.splice(2, 0, "before-after");
    } else if (!product.hasBeforeAfter) {
      finalConfig.sections = finalConfig.sections.filter((s: string) => s !== "before-after");
    }

    // Save to database
    const existingPage = await prisma.landingPage.findFirst({
      where: {
        ownerId: adminUserId,
        productId: product.id
      }
    });

    let savedPage;
    if (existingPage) {
      savedPage = await prisma.landingPage.update({
        where: { id: existingPage.id },
        data: {
          pageConfig: finalConfig,
          status: 'published'
        }
      });
    } else {
      savedPage = await prisma.landingPage.create({
        data: {
          ownerId: adminUserId,
          productId: product.id,
          pageConfig: finalConfig,
          status: 'published'
        }
      });
    }

    res.json({ message: 'Landing page generated and saved successfully', data: savedPage });
  } catch (error) {
    console.error('Error generating AI landing page:', error);
    res.status(500).json({ error: 'Failed to generate AI landing page' });
  }
});

export default router;
