

// Fix: Import express types directly to avoid conflicts with global DOM types.
import express, { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import cors from 'cors';
import cvRoutes from './routes/cvRoutes';
import imageRoutes from './routes/imageRoutes';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const port = process.env.PORT || 8080;

// Ensure the 'uploads' directory exists for multer
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 image data

app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/api/cv', cvRoutes);
app.use('/api/image', imageRoutes);

// Central error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Something went wrong!' });
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});