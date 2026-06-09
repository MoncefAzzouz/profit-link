import { Router, Response } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { authenticateToken, AuthRequest, requireAdmin } from '../middleware/auth';

const router = Router();

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

const VIDEO_MIME_EXT: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
  'video/x-matroska': 'mkv',
  'video/ogg': 'ogv',
};

const uploadVideo = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('video/')) cb(null, true);
    else cb(new Error('Only video files are allowed'));
  }
});

function publicBaseUrl(req: AuthRequest): string {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, '');
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
  const host = req.get('host');
  return `${proto}://${host}`;
}

// POST /api/upload/image (Any authenticated user → returns CDN-style URL)
// Used by admins (product images) and affiliates (store logo/banner in تعديل متجري).
router.post('/image', authenticateToken, upload.single('image'), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const ext = MIME_EXT[req.file.mimetype] || 'bin';
    const hash = crypto.createHash('sha1').update(req.file.buffer).digest('hex');
    const filename = `${hash}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Write only if absent — identical uploads deduplicate automatically.
    if (!fs.existsSync(filepath)) {
      fs.writeFileSync(filepath, req.file.buffer);
    }

    const url = `${publicBaseUrl(req)}/uploads/${filename}`;
    res.json({ message: 'Image uploaded successfully', url });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// POST /api/upload/video (Admin: Upload product video → returns CDN-style URL)
router.post('/video', authenticateToken, requireAdmin, uploadVideo.single('video'), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const ext = VIDEO_MIME_EXT[req.file.mimetype] || 'mp4';
    const hash = crypto.createHash('sha1').update(req.file.buffer).digest('hex');
    const filename = `${hash}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(filepath)) {
      fs.writeFileSync(filepath, req.file.buffer);
    }

    const url = `${publicBaseUrl(req)}/uploads/${filename}`;
    res.json({ message: 'Video uploaded successfully', url });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

export default router;
