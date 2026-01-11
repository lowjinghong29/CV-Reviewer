import * as fs from 'fs/promises';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export async function extractCvText(filePath: string, mimeType: string): Promise<string> {
    try {
        if (mimeType === 'application/pdf') {
            const dataBuffer = await fs.readFile(filePath);
            const data = await pdf(dataBuffer);
            return data.text.trim();
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ path: filePath });
            return result.value.trim();
        } else {
            throw new Error('Unsupported file type for text extraction.');
        }
    } catch (error) {
        console.error(`Failed to extract text from ${filePath}`, error);
        throw new Error('Could not read text from the uploaded file.');
    }
}
