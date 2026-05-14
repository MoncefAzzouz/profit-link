import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../db';

const router = Router();

// GET /api/store/settings (Fetch affiliate store settings)
router.get('/settings', authenticateToken, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const affiliateId = req.user?.userId;
    if (!affiliateId) return res.status(401).json({ error: 'Unauthorized' });

    const settings = await prisma.storeSettings.findUnique({
      where: { affiliateId }
    });
    
    if (!settings) {
      return res.json({ message: 'No settings configured yet', data: null });
    }
    
    // Return the combined settings object (merging top-level DB fields with the dynamic config JSON)
    const combinedSettings = {
      storeName: settings.storeName,
      storeLogo: settings.logoUrl,
      primaryColor: settings.primaryColor,
      fontFamily: settings.fontFamily,
      templateId: settings.templateId,
      ...(typeof settings.config === 'object' && settings.config !== null ? settings.config : {})
    };
    
    res.json({ data: combinedSettings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/store/settings (Update store customizations)
router.put('/settings', authenticateToken, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const affiliateId = req.user?.userId;
    if (!affiliateId) return res.status(401).json({ error: 'Unauthorized' });

    // The frontend sends the entire StoreSettings object in req.body
    const { storeName, storeLogo, primaryColor, fontFamily, templateId, ...restConfig } = req.body;

    const settings = await prisma.storeSettings.upsert({
      where: { affiliateId },
      update: { 
        storeName: storeName || '', 
        logoUrl: storeLogo, 
        primaryColor, 
        fontFamily, 
        templateId, 
        config: restConfig // Save USPs, Hero, Social Links here
      },
      create: { 
        affiliateId, 
        storeName: storeName || '', 
        logoUrl: storeLogo, 
        primaryColor, 
        fontFamily, 
        templateId, 
        config: restConfig 
      }
    });

    res.json({ message: 'Settings saved successfully', data: settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// GET /api/store/public/:storeName (Public storefront data)
router.get('/public/:storeName', async (req: Request, res: Response): Promise<any> => {
  try {
    const storeNameStr = String(req.params.storeName);
    
    // Find the affiliate by storeName or ID
    const affiliate = await prisma.user.findFirst({
      where: { 
        OR: [
          { storeName: { equals: storeNameStr, mode: 'insensitive' } },
          { id: storeNameStr }
        ],
        role: 'AFFILIATE' 
      },
      include: { storeSettings: true }
    }) as any;

    if (!affiliate) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Get products specifically added to this store
    const storeProductIds = (affiliate.storeSettings?.config as any)?.storeProductIds || [];
    
    const products = await prisma.product.findMany({
      where: { 
        status: 'active', 
        isVisible: true,
        hasLandingPage: true,
        ...(storeProductIds.length > 0 ? { id: { in: storeProductIds } } : { id: 'none' }) // If empty, show nothing
      },
      orderBy: { createdAt: 'desc' }
    });

    // We only send safe public data
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    res.json({
      data: {
        storeInfo: {
          id: affiliate.id,
          identifier: affiliate.storeName, // The unique slug (e.g. "dsad")
          storeName: affiliate.storeSettings?.storeName || affiliate.storeName, // Display Name
          storeLogo: affiliate.storeSettings?.logoUrl,
          primaryColor: affiliate.storeSettings?.primaryColor || '#000000',
          fontFamily: affiliate.storeSettings?.fontFamily || 'Cairo',
          templateId: affiliate.storeSettings?.templateId || 'modern',
          ...(typeof affiliate.storeSettings?.config === 'object' && affiliate.storeSettings.config !== null ? affiliate.storeSettings.config : {})
        },
        products: products.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          originalPrice: p.originalPrice,
          image: p.image,
          images: p.images,
          category: p.category,
          stock: p.stock,
          isTrend: p.isTrend,
          isFeatured: p.isFeatured,
          features: p.features
        }))
      }
    });
  } catch (error) {
    console.error('Public store error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// GET /api/store/pages/:id/public (Fetch a specific landing page for public view)
router.get('/pages/:id/public', async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const page = await prisma.landingPage.findUnique({
      where: { id: String(id) },
      include: {
        product: {
          select: {
            hasMarketingOffers: true,
            marketingOffers: true
          }
        }
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Landing page not found' });
    }

    // Increment views safely in the background
    prisma.landingPage.update({
      where: { id: String(id) },
      data: { views: { increment: 1 } }
    }).catch(err => console.error('Failed to increment views', err));

    res.json({ 
      data: {
        ...(page.pageConfig as any),
        id: page.id,
        productId: page.productId,
        ownerId: page.ownerId,
        status: page.status,
        views: page.views,
        conversions: page.conversions,
        hasMarketingOffers: (page as any).product?.hasMarketingOffers || false,
        marketingOffers: (page as any).product?.marketingOffers || []
      } 
    });
  } catch (error) {
    console.error('Public landing page error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/store/product-page/:productId/:affiliateId (Public: Fetch by product and affiliate)
router.get('/product-page/:productId/:affiliateId', async (req: Request, res: Response): Promise<any> => {
  try {
    const { productId, affiliateId } = req.params;
    
    let page = await prisma.landingPage.findFirst({
      where: { 
        productId: String(productId),
        ownerId: String(affiliateId),
        status: 'published'
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        product: {
          select: {
            hasMarketingOffers: true,
            marketingOffers: true
          }
        }
      }
    });

    // If affiliate has no customized page, fallback to ADMIN's latest page for this product
    if (!page) {
      page = await prisma.landingPage.findFirst({
        where: {
          productId: String(productId),
          owner: { role: 'ADMIN' },
          status: 'published'
        },
        orderBy: { updatedAt: 'desc' },
        include: {
          product: {
            select: {
              hasMarketingOffers: true,
              marketingOffers: true
            }
          }
        }
      });
    }

    if (!page) {
      return res.status(404).json({ error: 'Landing page not found' });
    }

    // Increment views safely
    prisma.landingPage.update({
      where: { id: page.id },
      data: { views: { increment: 1 } }
    }).catch(err => console.error('Failed to increment views', err));

    res.json({ 
      data: {
        ...(page.pageConfig as any),
        id: page.id,
        productId: page.productId,
        ownerId: page.ownerId,
        status: page.status,
        views: page.views,
        conversions: page.conversions,
        hasMarketingOffers: (page as any).product?.hasMarketingOffers || false,
        marketingOffers: (page as any).product?.marketingOffers || []
      } 
    });
  } catch (error) {
    console.error('Public product page lookup error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/store/pages/admin-default/:productId
router.get('/pages/admin-default/:productId', authenticateToken, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { productId } = req.params;
    
    // Find any landing page for this product owned by an ADMIN
    const adminPage = await prisma.landingPage.findFirst({
      where: {
        productId: String(productId),
        owner: {
          role: 'ADMIN'
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    if (!adminPage) {
      return res.status(404).json({ error: 'No admin page found' });
    }

    res.json({ data: adminPage });
  } catch (error) {
    console.error('Failed to fetch admin default page:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/store/pages (List all landing pages for the affiliate)
router.get('/pages', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const ownerId = req.user?.userId;
    if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    res.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30');

    const [pages, total] = await Promise.all([
      prisma.landingPage.findMany({
        where: { ownerId },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          productId: true,
          status: true,
          views: true,
          conversions: true,
          updatedAt: true,
          pageConfig: true,
          product: { select: { name: true } },
        },
      }),
      prisma.landingPage.count({ where: { ownerId } }),
    ]);

    const summaryPages = pages.map(p => {
      const config = p.pageConfig as any;
      return {
        id: p.id,
        productId: p.productId,
        status: p.status,
        views: p.views,
        conversions: p.conversions,
        updatedAt: p.updatedAt,
        productName: config?.productName || p.product?.name || "بدون اسم",
        template: config?.template || "modern",
        sections: config?.sections || [],
      };
    });

    res.json({
      data: summaryPages,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch landing pages' });
  }
});

// GET /api/store/pages/all (Admin: List ALL landing pages across all affiliates)
router.get('/pages/all', authenticateToken, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Verify user is admin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role.toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    res.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30');

    const [pages, total] = await Promise.all([
      prisma.landingPage.findMany({
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          productId: true,
          status: true,
          views: true,
          conversions: true,
          updatedAt: true,
          pageConfig: true,
          owner: { select: { id: true, name: true, storeName: true } },
          product: { select: { name: true } },
        },
      }),
      prisma.landingPage.count(),
    ]);

    const summaryPages = pages.map(p => {
      const config = p.pageConfig as any;
      return {
        id: p.id,
        productId: p.productId,
        status: p.status,
        views: p.views,
        conversions: p.conversions,
        updatedAt: p.updatedAt,
        ownerName: p.owner?.name || p.owner?.storeName || "",
        productName: config?.productName || p.product?.name || "بدون اسم",
        template: config?.template || "modern",
        sections: config?.sections || [],
      };
    });

    res.json({ 
      data: summaryPages,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Admin fetch all pages error:', error);
    res.status(500).json({ error: 'Failed to fetch landing pages' });
  }
});

// GET /api/store/pages/:id (Fetch FULL landing page for editing)
router.get('/pages/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const page = await prisma.landingPage.findUnique({
      where: { id: String(id) },
      include: {
        owner: { select: { id: true, name: true, storeName: true } },
        product: { select: { hasMarketingOffers: true, marketingOffers: true } }
      }
    });

    if (!page) return res.status(404).json({ error: 'Page not found' });

    // Verify ownership or admin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isAdmin = user?.role.toUpperCase() === 'ADMIN';
    if (!isAdmin && page.ownerId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const responseData = {
      ...page,
      pageConfig: {
        ...(page.pageConfig as any),
        hasMarketingOffers: (page as any).product?.hasMarketingOffers || false,
        marketingOffers: (page as any).product?.marketingOffers || []
      }
    };

    res.json({ data: responseData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch page details' });
  }
});

// POST /api/store/page (Save or Create Landing Page config)
router.post('/page', authenticateToken, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const ownerId = req.user?.userId;
    if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });

    const { productId, configData, status } = req.body;

    // Prevent duplicates: Check if a landing page already exists for this product and owner
    const existing = await prisma.landingPage.findFirst({
      where: {
        ownerId,
        productId: String(productId)
      }
    });

    if (existing) {
      const updated = await prisma.landingPage.update({
        where: { id: existing.id },
        data: {
          pageConfig: configData,
          status: status || existing.status
        }
      });
      return res.json({ message: 'Existing landing page updated successfully!', data: updated });
    }

    const page = await prisma.landingPage.create({
      data: {
        ownerId,
        productId,
        pageConfig: configData,
        status: status || 'draft'
      }
    });

    res.json({ message: 'Landing page created successfully!', data: page });
  } catch (error) {
    console.error('Failed to save landing page:', error);
    res.status(500).json({ error: 'Failed to save landing page' });
  }
});

// PUT /api/store/page/:id (Update existing landing page)
router.put('/page/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { configData, status } = req.body;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const existingPage = await prisma.landingPage.findUnique({ where: { id: id as string } });
    if (!existingPage) return res.status(404).json({ error: 'Page not found' });

    // Allow if owner OR admin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const userIsAdmin = user?.role.toUpperCase() === 'ADMIN';
    if (existingPage.ownerId !== userId && !userIsAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const page = await prisma.landingPage.update({
      where: { id: id as string },
      data: {
        pageConfig: configData,
        ...(status && { status })
      }
    });

    res.json({ message: 'Landing page updated successfully!', data: page });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update landing page' });
  }
});

// DELETE /api/store/page/:id (Delete landing page)
router.delete('/page/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const existingPage = await prisma.landingPage.findUnique({ where: { id: id as string } });
    if (!existingPage) return res.status(404).json({ error: 'Page not found' });

    // Allow if owner OR admin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const userIsAdmin = user?.role.toUpperCase() === 'ADMIN';
    if (existingPage.ownerId !== userId && !userIsAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.landingPage.delete({
      where: { id: id as string }
    });

    res.json({ message: 'Landing page deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete landing page' });
  }
});

// GET /api/store/page/:id (Public: Get landing page metadata to render storefront)
router.get('/page/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const page = await prisma.landingPage.update({
      where: { id: id as string },
      data: { views: { increment: 1 } } // Automatically tracks a view!
    });

    res.json({ data: page });
  } catch (error) {
    res.status(404).json({ error: 'Landing page not found' });
  }
});

// POST /api/store/generate-ai (Takes Context & Base64 Image -> Returns LandingPage JSON)
router.post('/generate-ai', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, contextText } = req.body;
    console.log("AI Request received. Context:", contextText);
    
    if (!process.env.GEMINI_API_KEY) {
      console.error("Missing GEMINI_API_KEY");
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing from backend' });
    }
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 payload is required' });
    }

    // Fixing the constructor to take only 1 argument as per SDK version 0.24.1
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are an expert E-Commerce Copywriter and UI/UX Designer creating high-converting landing pages for the Algerian market in Arabic.
      Analyze the attached image and the provided context: "${contextText || 'No context'}".
      
      Generate a STUNNING landing page configuration. Your response must be an expert-level blueprint.
      
      Respond ONLY with a valid JSON object matching this exact structure, with no markdown code blocks around it:
      {
        "productName": "Short catchy name in Arabic",
        "template": "modern", // pick best fit: luxury, modern, bold, dark, neon, tiktok, instagram, flash-sale
        "category": "Arabic category name",
        "price": 4500, // Reasonable DZD price (number)
        "originalPrice": 8000, 
        "primaryColor": "#HEX_COLOR", // Pick a color that matches the product in the image
        "accentColor": "#HEX_COLOR", // A complementary accent color
        "backgroundColor": "#F8F9FA", // A clean background color
        "heroTitle": "Extremely catchy Arabic title",
        "heroSubtitle": "A persuasive Arabic hook highlighting benefits",
        "urgencyText": "Arabic urgency/offer text",
        "features": ["Arabic Benefit 1", "Arabic Benefit 2", "Arabic Benefit 3", "Arabic Benefit 4"],
        "socialProof": [
          {"name": "Arabic Name", "text": "Arabic high-converting testimonial", "rating": 5},
          {"name": "Arabic Name", "text": "Arabic high-converting testimonial", "rating": 5}
        ],
        "faqItems": [
          {"q": "Arabic Question 1?", "a": "Arabic Answer 1"},
          {"q": "Arabic Question 2?", "a": "Arabic Answer 2"}
        ],
        "imageKeywords": {
          "hero": "3 keywords for main product shot, comma separated",
          "features": "3 keywords for lifestyle/use-case shot, comma separated",
          "testimonials": "3 keywords for happy customer/delivery shot, comma separated"
        },
        "suggestedSections": ["hero", "features", "reviews", "faq", "cta"]
      }
    `;

    // Extract the raw base64 string by removing the data URL prefix if present
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType || 'image/jpeg'
        }
      }
    ];
    

    console.log("Calling Gemini API...");
    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text();
    console.log("Raw Response from Gemini:", responseText);
    
    // Clean potential markdown wrap
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const configData = JSON.parse(cleanedText);

    res.status(200).json({ 
      message: 'AI Generation Successful',
      config: configData
    });

  } catch (error: any) {
    console.error("AI Error Details:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    res.status(500).json({ error: 'Failed to process AI Request', details: error.message });
  }
});

// GET /api/store/products (Fetch affiliate's store product IDs)
router.get('/products', authenticateToken, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const affiliateId = req.user?.userId;
    if (!affiliateId) return res.status(401).json({ error: 'Unauthorized' });

    const settings = await prisma.storeSettings.findUnique({
      where: { affiliateId }
    });

    if (!settings || !settings.config) {
      return res.json({ data: [] });
    }

    const config = settings.config as any;
    res.json({ data: config.storeProductIds || [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/store/products (Save affiliate's store product IDs)
router.put('/products', authenticateToken, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const affiliateId = req.user?.userId;
    if (!affiliateId) return res.status(401).json({ error: 'Unauthorized' });

    const { productIds } = req.body; // Array of product IDs

    // Get existing config or create new
    const existing = await prisma.storeSettings.findUnique({
      where: { affiliateId }
    });

    const existingConfig = (existing?.config as any) || {};
    const oldProductIds = (existingConfig.storeProductIds as string[]) || [];
    const updatedConfig = { ...existingConfig, storeProductIds: productIds };

    await prisma.storeSettings.upsert({
      where: { affiliateId },
      update: { config: updatedConfig },
      create: {
        affiliateId,
        storeName: '',
        config: updatedConfig
      }
    });

    // Handle automated landing page creation for NEW products
    const newProductIds = (productIds as string[]).filter((id: string) => !oldProductIds.includes(id));

    if (newProductIds.length > 0) {
      const [products, existingPages] = await Promise.all([
        prisma.product.findMany({ where: { id: { in: newProductIds } } }),
        prisma.landingPage.findMany({
          where: { ownerId: affiliateId, productId: { in: newProductIds } },
          select: { productId: true }
        })
      ]);

      const existingProductIds = new Set(existingPages.map(p => p.productId));
      const productsNeedingPages = products.filter(p => !existingProductIds.has(p.id));

      if (productsNeedingPages.length > 0) {
        const newPages = productsNeedingPages.map(product => ({
          ownerId: affiliateId,
          productId: product.id,
          status: "draft",
          pageConfig: {
            productName: product.name,
            template: "original",
            heroTitle: product.name,
            heroSubtitle: product.description || "أفضل جودة بأفضل سعر في السوق الجزائري",
            price: product.price,
            originalPrice: product.originalPrice,
            category: product.category,
            heroImage: product.image,
            galleryImages: Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image],
            features: Array.isArray(product.features) && product.features.length > 0 ? product.features : ["جودة عالية مضمونة", "توصيل سريع لكل الولايات", "الدفع عند الاستلام", "ضمان الاستبدال والاسترجاع"],
            sections: ["hero", "urgency-bar", "features", "gallery", "social-proof", "reviews", "shipping", "cta"],
            primaryColor: "#10b981",
            accentColor: "#3b82f6",
            backgroundColor: "#ffffff",
            ctaText: "اطلب الآن",
            ctaStyle: "pill",
            showReviews: true,
            showCountdown: false,
            showGuarantee: true,
            showFreeShipping: product.showFreeShipping || false,
            fontFamily: "cairo",
            availableColors: product.hasColors ? product.availableColors : [],
            availableSizes: product.hasSizes ? product.availableSizes : []
          }
        }));

        await prisma.landingPage.createMany({ data: newPages });
      }
    }

    res.json({ message: 'Store products saved and landing pages initialized' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/store/favorites (Fetch affiliate's favorite product IDs)
router.get('/favorites', authenticateToken, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const affiliateId = req.user?.userId;
    if (!affiliateId) return res.status(401).json({ error: 'Unauthorized' });

    const settings = await prisma.storeSettings.findUnique({ where: { affiliateId } });
    if (!settings || !settings.config) return res.json({ data: [] });

    const config = settings.config as any;
    res.json({ data: config.favoriteProductIds || [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/store/favorites (Save affiliate's favorite product IDs)
router.put('/favorites', authenticateToken, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const affiliateId = req.user?.userId;
    if (!affiliateId) return res.status(401).json({ error: 'Unauthorized' });

    const { productIds } = req.body;

    const existing = await prisma.storeSettings.findUnique({ where: { affiliateId } });
    const existingConfig = (existing?.config as any) || {};
    const updatedConfig = { ...existingConfig, favoriteProductIds: productIds };

    await prisma.storeSettings.upsert({
      where: { affiliateId },
      update: { config: updatedConfig },
      create: { affiliateId, storeName: '', config: updatedConfig }
    });

    res.json({ message: 'Favorites saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
