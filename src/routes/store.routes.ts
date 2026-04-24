import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

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
        storeName: storeName || 'My Store', 
        logoUrl: storeLogo, 
        primaryColor, 
        fontFamily, 
        templateId, 
        config: restConfig // Save USPs, Hero, Social Links here
      },
      create: { 
        affiliateId, 
        storeName: storeName || 'My Store', 
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

    // Fetch active products for the store
    const products = await prisma.product.findMany({
      where: { status: 'active', isVisible: true },
      orderBy: { createdAt: 'desc' }
    });

    // We only send safe public data
    res.json({
      data: {
        storeInfo: {
          id: affiliate.id,
          storeName: affiliate.storeSettings?.storeName || affiliate.storeName,
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
      where: { id: String(id) }
    });

    if (!page) {
      return res.status(404).json({ error: 'Landing page not found' });
    }

    // Increment views safely in the background
    prisma.landingPage.update({
      where: { id: String(id) },
      data: { views: { increment: 1 } }
    }).catch(err => console.error('Failed to increment views', err));

    res.json({ data: page.pageConfig });
  } catch (error) {
    console.error('Public landing page error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/store/pages (List all landing pages for the affiliate)
router.get('/pages', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const ownerId = req.user?.userId;
    if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });

    const pages = await prisma.landingPage.findMany({
      where: { ownerId },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({ data: pages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch landing pages' });
  }
});

// POST /api/store/page (Save or Create Landing Page config)
router.post('/page', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const ownerId = req.user?.userId;
    if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });

    const { productId, configData } = req.body;

    const page = await prisma.landingPage.create({
      data: {
        ownerId,
        productId,
        pageConfig: configData 
      }
    });

    res.json({ message: 'Landing page created successfully!', data: page });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save landing page' });
  }
});

// PUT /api/store/page/:id (Update existing landing page)
router.put('/page/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const ownerId = req.user?.userId;
    const { id } = req.params;
    const { configData, status } = req.body;

    if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });

    const existingPage = await prisma.landingPage.findUnique({ where: { id: id as string } });
    if (!existingPage || existingPage.ownerId !== ownerId) {
      return res.status(404).json({ error: 'Page not found or unauthorized' });
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
    const ownerId = req.user?.userId;
    const { id } = req.params;

    if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });

    const existingPage = await prisma.landingPage.findUnique({ where: { id: id as string } });
    if (!existingPage || existingPage.ownerId !== ownerId) {
      return res.status(404).json({ error: 'Page not found or unauthorized' });
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
    const updatedConfig = { ...existingConfig, storeProductIds: productIds };

    await prisma.storeSettings.upsert({
      where: { affiliateId },
      update: { config: updatedConfig },
      create: {
        affiliateId,
        storeName: 'My Store',
        config: updatedConfig
      }
    });

    res.json({ message: 'Store products saved successfully' });
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
      create: { affiliateId, storeName: 'My Store', config: updatedConfig }
    });

    res.json({ message: 'Favorites saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
