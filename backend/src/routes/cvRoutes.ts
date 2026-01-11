

// Fix: Import express types directly to avoid conflicts with global DOM types.
import express, { Request, Response } from 'express';
import multer from 'multer';
import { extractCvText } from '../services/textExtraction';
import { reviewCvWithGemini, rewriteCvWithGemini } from '../services/geminiClient';
import { CvReviewResult, ImprovedCv } from '../types';
import * as fs from 'fs/promises';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'));
        }
    },
});

router.post('/upload', upload.single('cvFile'), async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    const { language = 'en' } = req.body;
    const filePath = req.file.path;

    try {
        const cvText = await extractCvText(filePath, req.file.mimetype);

        if (cvText.length < 100) {
            return res.status(400).json({ success: false, error: 'CV content is too short or could not be read.' });
        }

        const review: CvReviewResult = await reviewCvWithGemini(cvText, language);
        
        res.status(200).json({
            success: true,
            cvText,
            review,
        });
    } catch (error: any) {
        console.error('Error during file processing:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to process CV.' });
    } finally {
        // Clean up the uploaded file
        await fs.unlink(filePath);
    }
});

router.post('/rewrite', async (req: Request, res: Response) => {
    const { cvText, targetRole, language } = req.body;

    if (!cvText) {
        return res.status(400).json({ success: false, error: 'cvText is required.' });
    }

    try {
        const improvedCv: ImprovedCv = await rewriteCvWithGemini({
            cvText,
            targetRole,
            language,
        });

        res.status(200).json({
            success: true,
            improvedCv,
        });
    } catch (error: any) {
        console.error('Error during CV rewrite:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to rewrite CV.' });
    }
});


export default router;