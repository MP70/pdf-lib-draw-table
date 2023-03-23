import { PDFHexString, PDFDocument } from "pdf-lib";
export declare function beginMarkedContent(
  pdfDoc: PDFDocument,
  mcid: PDFHexString
): Promise<string>;
export declare function endMarkedContent(): Promise<string>;
export declare function generateUniqueMCID(
  pdfDoc: PDFDocument
): Promise<PDFHexString>;
