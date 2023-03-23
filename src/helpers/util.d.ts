import { PDFFont, Color, PDFPage } from "pdf-lib";
import { Link, Image, Alignment, CustomStyledText } from "../../types";
export declare function isCustomStyledText(
  content: any
): content is CustomStyledText;
export declare function isImage(content: any): content is Image;
export declare function isLink(content: any): content is Link;
export declare function drawBorder(
  page: PDFPage,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  borderWidth: number,
  borderColor: Color
): void;
export declare function wrapText(
  text: string,
  maxWidth: number,
  font: PDFFont,
  textSize: number,
  breakWords?: boolean
): string[];
/**
 * Get the text coordinates for a cell based on alignment, position, and dimensions.
 *
 * @param align - Alignment of the text within the cell ("left", "center", or "right").
 * @param cellX - X coordinate of the cell.
 * @param textY - Y coordinate of the text.
 * @param horizontalMargin - Margin left and right of the text.
 */
export declare function getTextCoordinates(
  align: Alignment | undefined,
  cellX: number,
  textY: number,
  horizontalMargin: number,
  verticalMargin: number,
  cellWidth: number,
  textWidth: number,
  borderWidth: number
): {
  x: number;
  y: number;
};
export declare function getImageCoordinates(
  align: Alignment,
  x: number,
  y: number,
  width: number,
  imgWidth: number,
  imgHeight: number,
  horizontalMargin?: number
): {
  x: number;
  y: number;
};
