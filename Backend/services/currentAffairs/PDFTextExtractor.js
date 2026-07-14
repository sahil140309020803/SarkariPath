import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfModule = require('pdf-parse');

export const extractTextFromPDF = async (pdfBuffer) => {
  let parser = null;
  try {
    let data;
    if (typeof pdfModule === 'function') {
      data = await pdfModule(pdfBuffer);
      return data.text || '';
    } else if (pdfModule && typeof pdfModule.PDFParse === 'function') {
      parser = new pdfModule.PDFParse({ data: pdfBuffer });
      const result = await parser.getText();
      return result.text || '';
    } else if (pdfModule && typeof pdfModule.default === 'function') {
      data = await pdfModule.default(pdfBuffer);
      return data.text || '';
    } else {
      throw new Error("Could not find a valid PDF parsing function or class in the pdf-parse module.");
    }
  } catch (error) {
    console.error("[PDFTextExtractor] Error extracting text from PDF:", error);
    throw new Error(`PDF text extraction failed: ${error.message}`);
  } finally {
    if (parser && typeof parser.destroy === 'function') {
      try {
        await parser.destroy();
      } catch (err) {
        console.error("[PDFTextExtractor] Error destroying parser:", err);
      }
    }
  }
};
