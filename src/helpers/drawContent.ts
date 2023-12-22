import { PDFPage, PDFFont, Color, PDFName, PDFRef, PDFDocument } from "pdf-lib";
import { CellElement, Alignment, CustomStyledText } from "../../types";
import { getTextCoordinates, wrapText, getImageCoordinates } from "./util";
import { fetchImage } from "./images";

/**
 * Draw an element (text, image, or link) on a PDF page.
 *
 * @param page - The PDF page to draw the element on.
 * @param element - The cell element to draw.
 * @param x - The x coordinate of the element.
 * @param y - The y coordinate of the element.
 * @param width - The width of the element.
 * @param font - The font to use for text elements.
 * @param textSize - The text size to use for text elements.
 * @param color - The color to use for text elements.
 * @param alignment - The alignment for text elements.
 * @param linkColor - The color to use for link elements.
 * @param lineHeight - The line height to use for text elements.
 * @param horizontalMargin - The horizontal margin for text elements.
 * @param verticalMargin - The vertical margin for text elements.
 * @param borderWidth - The border width to account for in the element.
 *
 * @returns The height of the drawn element.
 */
export async function drawElement(
  page: PDFPage,
  element: CellElement,
  x: number,
  y: number,
  width: number,
  font: PDFFont,
  textSize: number,
  color: Color,
  alignment: Alignment,
  linkColor: Color,
  lineHeight: number,
  horizontalMargin: number,
  verticalMargin: number,
  borderWidth: number,
): Promise<number> {
  try {
    // Handle text elements
    if (typeof element === "string" || element.type === "text") {
      const elem =
        typeof element === "object" && element.type === "text"
          ? element
          : ({ text: element } as CustomStyledText);
      const wrappedText = wrapText(
        elem.text,
        width - 2 * horizontalMargin,
        elem.font || font,
        elem.textSize || textSize,
      );
      let textY = y - (elem.textSize || textSize) - verticalMargin;
      const lineSpacing =
        (elem.font || font).heightAtSize(elem.textSize || textSize) *
        lineHeight;

      for (const line of wrappedText) {
        const textWidth = (elem.font || font).widthOfTextAtSize(
          line,
          elem.textSize || textSize,
        );
        const { x: textX, y: textYCoord } = getTextCoordinates(
          elem.alignment || alignment,
          x,
          textY,
          horizontalMargin,
          verticalMargin,
          width,
          textWidth,
          borderWidth,
        );
        page.drawText(line, {
          x: textX,
          y: textYCoord,
          size: elem.textSize || textSize,
          font: elem.font || font,
          color: elem.textColor || color,
        });
        textY -= lineSpacing;
      }
      return wrappedText.length * lineSpacing;
    }
    // Handle image elements
    else if (element.type === "image") {
      let image;
      if (element.data) {
        // Embed the image data directly
        image = await page.doc.embedPng(element.data);
      } else if (element.src) {
        // Fetch the image data from the URL and embed it
        const imageData = await fetchImage(element.src);
        image = await page.doc.embedPng(imageData);
      } else {
        throw new Error(
          "Image element must have either a 'data' or 'src' property.",
        );
      }

      const scaleFactor = Math.min(
        (width - 2 * (element.horizontalMargin || horizontalMargin)) /
          element.width,
        element.height / element.height,
      );
      const imgHeight = element.height * scaleFactor;
      const imgWidth = element.width * scaleFactor;

      // Calculate image coordinates based on alignment and margins
      const { x: imgX, y: imgY } = getImageCoordinates(
        element.alignment || alignment,
        x,
        y,
        width,
        imgHeight,
        imgWidth,
        element.horizontalMargin || horizontalMargin,
      );

      // Draw the image on the PDF page
      page.drawImage(image, {
        x: imgX,
        y: imgY,
        width: imgWidth,
        height: imgHeight,
      });

      return imgHeight;
    }

    // Handle link elements
    else if (element.type === "link") {
      const wrappedText = wrapText(
        element.text,
        width - 2 * horizontalMargin,
        element.font || font,
        element.textSize || textSize,
      );
      let offsetY = element.textSize || textSize;
      const lineSpacing =
        (element.font || font).heightAtSize(element.textSize || textSize) *
        lineHeight;

      wrappedText.forEach((line) => {
        const linkWidth = (element.font || font).widthOfTextAtSize(
          line,
          element.textSize || textSize,
        );
        const height = (element.font || font).heightAtSize(
          element.textSize || textSize,
        );

        const { x: textX, y: textYCoord } = getTextCoordinates(
          element.alignment || alignment,
          x,
          y - offsetY,
          horizontalMargin,
          verticalMargin,
          width,
          linkWidth,
          borderWidth,
        );

        // Draw the text for the link
        page.drawText(line, {
          x: textX,
          y: textYCoord,
          size: element.textSize || textSize,
          font: element.font || font,
          color: element.textColor || linkColor,
        });

        // Determine if it is an internal or external link
        const isInternalLink = "page" in element;

        // Create the link annotation based on the internal or external link type
        const link = page.doc.context.obj({
          Type: "Annot",
          Subtype: "Link",
          Rect: [
            textX,
            textYCoord,
            textX + linkWidth,
            textYCoord + height * lineSpacing,
          ], // Include the line spacing in the rectangle height
          Border: [0, 0, 0],
          C: [0, 0, 1],
        });

        if (isInternalLink) {
          const targetPageRef = getPageRefByNumber(page.doc, element.page!);
          if (targetPageRef) {
            // Set the action for internal links
            link.set(
              PDFName.of("A"),
              page.doc.context.obj({
                Type: PDFName.of("Action"),
                S: PDFName.of("GoTo"),
                D: targetPageRef,
              }),
            );
          }
        } else {
          // Set the action for external links
          link.set(
            PDFName.of("A"),
            page.doc.context.obj({
              Type: PDFName.of("Action"),
              S: PDFName.of("URI"),
              URI: element.url,
            }),
          );
        }

        // Add the link annotation to the page
        if (!page.node.Annots()) {
          page.node.set(PDFName.of("Annots"), page.doc.context.obj([]));
        }
        page.node.Annots()?.push(link);

        offsetY += lineSpacing;
      });
      return wrappedText.length * lineSpacing;
    }
  } catch (error) {
    console.error("Error drawing element:", error);
  }
  return 0;
}

function getPageRefByNumber(
  doc: PDFDocument,
  pageNumber: number,
): PDFRef | null {
  const pages = doc.getPages();
  if (pageNumber > pages.length) {
    return null;
  }

  const targetPage = pages[pageNumber - 1];
  const targetPageRef = targetPage.ref;

  return targetPageRef;
}
