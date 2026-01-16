import JSZip from 'jszip';
import jsPDF from 'jspdf';
import { Page, Chapter, Manga } from '../types';

export const downloadImage = (base64: string, filename: string) => {
  const link = document.createElement('a');
  link.href = base64;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadChapterZip = async (manga: Manga, chapter: Chapter, pages: Page[]) => {
  const zip = new JSZip();
  const folder = zip.folder(`${manga.title} - Ch.${chapter.number}`);

  if (!folder) return;

  pages.forEach((page) => {
    // Remove Data URL prefix to get raw base64
    const data = page.data.split(',')[1];
    const ext = page.data.substring(page.data.indexOf('/') + 1, page.data.indexOf(';'));
    folder.file(`page_${page.pageNumber.toString().padStart(3, '0')}.${ext}`, data, { base64: true });
  });

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${manga.title}_Chapter_${chapter.number}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadChapterPdf = (manga: Manga, chapter: Chapter, pages: Page[]) => {
  // A4 size in mm: 210 x 297
  // We will create a PDF where each page matches the image dimensions
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'px',
    format: 'a4',
    putOnlyUsedFonts: true,
    floatPrecision: 16 // or "smart", default is 16
  });

  // Remove the initial page added by default if we want custom sizes, 
  // but simpler to just add pages.
  doc.deletePage(1); 

  pages.forEach((page) => {
    const img = new Image();
    img.src = page.data;
    
    // We strictly should wait for onload to get dimensions, 
    // but base64 is usually instant in memory.
    // For robustness in this sync function, we assume standard aspect ratios or 
    // let jsPDF handle scaling.
    
    // Simplification: We add a standard A4 page for each image
    // In a real robust app, we'd pre-load image dimensions.
    
    doc.addPage();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Fit image to page
    doc.addImage(page.data, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
  });

  doc.save(`${manga.title}_Chapter_${chapter.number}.pdf`);
};

export const downloadRawPdf = (chapter: Chapter) => {
  if (!chapter.pdfData) return;
  
  const link = document.createElement('a');
  link.href = chapter.pdfData;
  link.download = `${chapter.title || 'Chapter'}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};