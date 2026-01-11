

// Fix: Import express types directly to avoid conflicts with global DOM types.
import express, { Request, Response } from 'express';
import { analyzeImageWithGemini } from '../services/geminiClient';

const router = express.Router();

router.post('/analyze', async (req: Request, res: Response) => {
    const { prompt, imageBase64, mimeType } = req.body;

    if (!prompt || !imageBase64 || !mimeType) {
        return res.status(400).json({ success: false, error: 'Prompt, imageBase64, and mimeType are required.' });
    }

    try {
        const result = await analyzeImageWithGemini(prompt, imageBase64, mimeType);
        res.status(200).json({ success: true, result });
    } catch (error: any) {
        console.error('Error during image analysis:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to analyze image.' });
    }
});

export default router;