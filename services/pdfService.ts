
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ImprovedCv } from '../types';
import ResumeTemplate from '../components/ResumeTemplate';

// This service runs in the browser and uses dynamic imports for heavy libraries.
declare global {
    interface Window {
      jspdf: () => Promise<any>;
      html2canvas: () => Promise<any>;
    }
}
  
export async function generatePdfFromImprovedCv(cv: ImprovedCv): Promise<void> {
    const jspdfModule = await window.jspdf();
    const html2canvasModule = await window.html2canvas();

    if (!jspdfModule || !html2canvasModule) {
        throw new Error("PDF generation libraries are not loaded.");
    }

    const { jsPDF } = jspdfModule;
    const html2canvas = html2canvasModule.default;

    // Create a temporary container for rendering the component
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px'; // Position off-screen
    document.body.appendChild(container);

    const contentRef = React.createRef<HTMLDivElement>();

    // Use ReactDOM.createRoot to render the component into the container
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(ResumeTemplate, { cv, innerRef: contentRef }));
    
    // Allow a moment for the component to render fully
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const contentElement = contentRef.current;
    if (!contentElement) {
        document.body.removeChild(container);
        throw new Error('Could not render resume template for PDF generation.');
    }
    
    try {
        const canvas = await html2canvas(contentElement, {
            scale: 2, // Improve resolution
            useCORS: true,
        });

        const imgData = canvas.toDataURL('image/png');
        
        // A4 page dimensions in mm
        const pdfWidth = 210;
        const pdfHeight = 297;
        
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;

        let finalImgWidth = pdfWidth;
        let finalImgHeight = pdfWidth / ratio;
        
        // If the content is taller than one page, we might need to handle splitting
        // For this POC, we'll scale to fit one page
        if (finalImgHeight > pdfHeight) {
            finalImgHeight = pdfHeight;
            finalImgWidth = pdfHeight * ratio;
        }

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });
        
        const xOffset = (pdfWidth - finalImgWidth) / 2;
        pdf.addImage(imgData, 'PNG', xOffset, 0, finalImgWidth, finalImgHeight);
        pdf.save('improved_cv.pdf');
    } finally {
        // Clean up the temporary container
        root.unmount();
        document.body.removeChild(container);
    }
}
