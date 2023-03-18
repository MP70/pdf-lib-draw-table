import { PDFHexString, PDFName, PDFDocument } from "pdf-lib";
// I've commented this whole set of functions well as I understand it's not very self explanatory like the others..
// I had to do a some research for this section, so while I *think* this is standards compliant, I'd love to know if anyone has a better idea, or any experiance with this.. (?)
// The reason we mark this is for accesability (text/sreen readers). This has not had much testing..

// This function adds marked content to the PDF document with a given MCID (Marked Content Identifier).
// It returns a string that should be used in the PDF content stream to begin the marked content section.
export async function beginMarkedContent(
  pdfDoc: PDFDocument,
  mcid: PDFHexString
): Promise<string> {
  // Get the document catalog
  const catalog = pdfDoc.catalog;

  // If the catalog does not have the "Marked" property set, add it and set it to true
  if (!catalog.get(PDFName.of("Marked"))) {
    catalog.set(PDFName.of("Marked"), pdfDoc.context.obj(true));
  }

  // Return the content stream string to begin the marked content section with the specified MCID
  return `q\n/Span<</MCID ${mcid.asString()}>> BDC`;
}

// This async function returns a string that should be used in the PDF content stream to end the marked content section.
export async function endMarkedContent(): Promise<string> {
  // Pretty sure this is legit all we need.
  return "EMC\nQ";
}

// This async function generates a unique MCID (Marked Content Identifier) for the PDF document.
// It returns the MCID as a PDFHexString.
export async function generateUniqueMCID(
  pdfDoc: PDFDocument
): Promise<PDFHexString> {
  // Get the document catalog
  const catalog = pdfDoc.catalog;
  // Get the StructTreeRoot from the catalog
  const structTreeRoot = catalog.lookup(PDFName.of("StructTreeRoot"));
  let maxMCID = -1;

  if (structTreeRoot) {
    // Define a function to recursively find the maximum MCID in the structure tree
    const findMaxMCID = (node: any) => {
      const mcid = node.get(PDFName.of("MCID"));
      if (mcid) {
        maxMCID = Math.max(maxMCID, parseInt(mcid.asString(), 10));
      }
      const kids = node.lookup(PDFName.of("K"));
      if (Array.isArray(kids)) {
        kids.forEach(findMaxMCID);
      }
    };

    // Call the findMaxMCID function starting from the structure tree root
    findMaxMCID(structTreeRoot);
  }

  // Return a unique MCID by incrementing the maximum MCID found
  return PDFHexString.fromText(String(maxMCID + 1));
}
