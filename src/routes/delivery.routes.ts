import { Router, Request, Response } from 'express';
import { EcotrackService } from '../services/ecotrack.service';

const router = Router();

// Default Shipping Rates (Example - can be moved to DB later)
const DEFAULT_RATES: Record<string, { home: number; desk: number }> = {
  "16": { home: 400, desk: 250 }, // Algiers
  "default": { home: 600, desk: 400 },
  "south": { home: 1000, desk: 800 }
};

const southWilayas = ["01", "08", "11", "30", "32", "33", "37", "39", "45", "47", "49", "50", "52", "53", "54", "55", "56", "57", "58"];

// GET /api/delivery/wilayas
router.get('/wilayas', async (req: Request, res: Response) => {
  try {
    const wilayas = await EcotrackService.getWilayas();
    // Wilayas are basically static — cache aggressively.
    res.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.json({ data: wilayas });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wilayas' });
  }
});

// GET /api/delivery/communes
router.get('/communes', async (req: Request, res: Response) => {
  try {
    const { wilaya_id } = req.query;
    const communes = await EcotrackService.getCommunes(wilaya_id as string);
    res.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.json({ data: communes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch communes' });
  }
});

// GET /api/delivery/rates
router.get('/rates', async (req: Request, res: Response) => {
  try {
    const { wilaya_id } = req.query;

    if (!wilaya_id) {
      return res.json({ data: DEFAULT_RATES });
    }

    const feesResponse = await EcotrackService.getFees();
    const fees = feesResponse?.livraison || [];
    const fee = fees.find((f: any) => String(f.wilaya_id) === String(wilaya_id));

    if (fee) {
      return res.json({
        data: {
          home: parseInt(fee.tarif || "600"),
          desk: parseInt(fee.tarif_stopdesk || "400")
        }
      });
    }

    const id = String(wilaya_id);
    let rate = DEFAULT_RATES[id];

    if (!rate) {
      if (southWilayas.includes(id)) {
        rate = DEFAULT_RATES["south"];
      } else {
        rate = DEFAULT_RATES["default"];
      }
    }

    res.json({ data: rate });
  } catch (error) {
    console.error('Error fetching rates:', error);
    res.status(500).json({ error: 'Failed to fetch shipping rates' });
  }
});

// GET /api/delivery/all-rates (Combines wilayas and fees for the dashboard)
router.get('/all-rates', async (req: Request, res: Response) => {
  try {
    const [wilayasResponse, feesResponse] = await Promise.all([
      EcotrackService.getWilayas(),
      EcotrackService.getFees()
    ]);

    const wilayas = Array.isArray(wilayasResponse) ? wilayasResponse : [];
    const fees = feesResponse?.livraison || []; // Ecotrack wraps fees in a 'livraison' array

    const combined = wilayas.map((w: any) => {
      // Find fee for this wilaya.
      const fee = Array.isArray(fees) 
        ? fees.find((f: any) => String(f.wilaya_id) === String(w.wilaya_id))
        : null;

      // Ensure wilaya_id is padded with zero for matching frontend expectations if needed
      const codeStr = String(w.wilaya_id).padStart(2, '0');

      return {
        wilaya: w.wilaya_name,
        code: codeStr,
        homePrice: fee ? parseInt(fee.tarif || "600") : 600,
        officePrice: fee ? parseInt(fee.tarif_stopdesk || "400") : 400,
        deliveryTime: "48-72 ساعة" // Ecotrack doesn't provide this in the simple list
      };
    });

    res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    res.json({ data: combined });
  } catch (error) {
    console.error('Error fetching all rates:', error);
    res.status(500).json({ error: 'Failed to fetch combined shipping rates' });
  }
});

export default router;
