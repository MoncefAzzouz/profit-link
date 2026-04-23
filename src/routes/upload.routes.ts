import { Router, Response } from 'express';
import multer from 'multer';
import { authenticateToken, AuthRequest, requireAdmin } from '../middleware/auth';

const router = Router();

// Use memory storage (Render has ephemeral filesystem)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// POST /api/upload/image (Admin: Upload product image → returns base64 data URL)
router.post('/image', authenticateToken, requireAdmin, upload.single('image'), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Convert buffer to base64 data URL
    const base64 = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

    res.json({ 
      message: 'Image uploaded successfully',
      url: dataUrl 
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;
