import { PDFPage, PDFFont, Color } from "pdf-lib";
import { CellElement, Alignment } from "../../types";
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
export declare function drawElement(
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
): Promise<number>;
