import { Router } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { getS3Client } from '../config/s3.js';
import { getEnv } from '../config/env.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import logger from '../config/logger.js';

const router = Router();

const env = getEnv();
const s3Client = getS3Client();

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: env.S3_BUCKET,
    key: (req, file, cb) => {
      const key = `cvs/${req.user.id}/${Date.now()}-${file.originalname}`;
      cb(null, key);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF and DOCX files are allowed'));
  },
});

async function extractText(buffer, mimetype) {
  try {
    if (mimetype === 'application/pdf') {
      const pdfParse = await import('pdf-parse').then(m => m.default);
      const data = await pdfParse(buffer);
      return data.text?.slice(0, 10000) || '';
    }
    if (mimetype.includes('wordprocessingml')) {
      const mammoth = await import('mammoth');
      const result = await mammoth.default.extractRawText({ buffer });
      return result.value?.slice(0, 10000) || '';
    }
  } catch (err) {
    logger.warn('CV text extraction failed', { error: err.message });
  }
  return '';
}

router.post('/', authenticate, requireRole('student'), (req, res) => {
  upload.single('cv')(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) return res.status(400).json({ error: err.message });
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const s3Key = req.file.key;
    const location = req.file.location;

    let extractedText = '';
    try {
      const response = await fetch(req.file.location);
      const buffer = Buffer.from(await response.arrayBuffer());
      extractedText = await extractText(buffer, req.file.mimetype);
    } catch (e) {
      logger.warn('Could not fetch CV for parsing', { key: s3Key });
    }

    res.status(201).json({ key: s3Key, location, extractedText });
  });
});

export default router;
