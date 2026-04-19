import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const prisma = new PrismaClient();

// GET /api/store/settings (Fetch affiliate store and pixel settings)
router.get('/settings', async (req: Request, res: Response) => {
  try {
    // TODO: Replace with real JWT Auth middleware
    const affiliateId = req.header('x-user-id');
    if (!affiliateId) return res.status(401).json({ error: 'Missing x-user-id header' });

    const settings = await prisma.storeSettings.findUnique({
      where: { affiliateId }
    });
    
    if (!settings) {
      return res.json({ message: 'No settings configured yet', data: null });
    }
    res.json({ data: settings });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/store/settings (Update colors/logos/pixels)
router.put('/settings', async (req: Request, res: Response) => {
  try {
    const affiliateId = req.header('x-user-id');
    if (!affiliateId) return res.status(401).json({ error: 'Missing x-user-id header' });

    const { storeName, logoUrl, primaryColor, fontFamily, templateId, pixelsConfig } = req.body;

    const settings = await prisma.storeSettings.upsert({
      where: { affiliateId },
      update: { storeName, logoUrl, primaryColor, fontFamily, templateId, pixelsConfig },
      create: { affiliateId, storeName, logoUrl, primaryColor, fontFamily, templateId, pixelsConfig }
    });

    res.json({ message: 'Settings saved successfully', data: settings });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/store/page (Save generated Landing Page config)
router.post('/page', async (req: Request, res: Response) => {
  try {
    const ownerId = req.header('x-user-id');
    if (!ownerId) return res.status(401).json({ error: 'Missing x-user-id header' });

    const { productId, configData } = req.body;

    // We store the entire visual blueprint inside 'pageConfig' json column
    // The previous fields like productName, price, etc. belong inside this block!
    const page = await prisma.landingPage.create({
      data: {
        ownerId,
        ...(productId && { productId }),
        pageConfig: configData 
      }
    });

    res.json({ message: 'Landing page created successfully!', data: page });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save landing page' });
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

export default router;
