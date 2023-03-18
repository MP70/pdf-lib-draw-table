import {
  PDFFont,
 
  Color,
  PDFPage,

} from "pdf-lib";
import { Link, Image, Alignment } from "../types";

export function isImage(content: any): content is Image {
  return content.hasOwnProperty("width") && content.hasOwnProperty("height");
}

export function isLink(content: any): content is Link {
  return content.hasOwnProperty("text") && content.hasOwnProperty("url");
}

// Draws a border line between two points on a PDF page
export function drawBorder(
  page: PDFPage,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  borderWidth: number,
  borderColor: Color
): void {
  // Define the start and end coordinates for the border line
  const lineCoordinates = {
    start: { x: startX, y: startY },
    end: { x: endX, y: endY },
  };

  // Draw the border line on the PDF page
  page.drawLine({
    ...lineCoordinates,
    thickness: borderWidth,
    color: borderColor,
  });
}

// Wraps a text into multiple lines based on the maxWidth, font, and fontSize provided
export function wrapText(
  text: string,
  maxWidth: number,
  font: PDFFont,
  fontSize: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const testLine = line + word + " ";
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    // If the testWidth is greater than maxWidth, start a new line
    if (testWidth > maxWidth) {
      lines.push(line.trim());
      line = word + " ";
    } else {
      line = testLine;
    }
  }

  // Add the remaining line if it's not empty
  if (line.trim()) {
    lines.push(line.trim());
  }

  return lines;
}

// Returns the x and y coordinates for placing text in a cell, depending on the alignment
export function getTextCoordinates(
  align: Alignment = "left",
  cellX: number,
  cellWidth: number,
  textY: number,
  margin: number
) {
  let x: number;

  // Calculate the x coordinate based on the alignment
  if (align === "center") {
    x = cellX + cellWidth / 2;
  } else if (align === "right") {
    x = cellX + cellWidth - margin;
  } else {
    // Default to left alignment
    x = cellX + margin;
  }

  return { x, y: textY };
}
//basically the same as above for images..
export function getImageCoordinates(
  align: Alignment,
  x: number,
  y: number,
  width: number,
  imgWidth: number,
  imgHeight: number,
  horizontalMargin: number = 0
): { x: number; y: number } {
  let imageX: number;
  let imageY: number = y - imgHeight;

  if (align === "center") {
    imageX = x + (width - imgWidth) / 2;
  } else if (align === "right") {
    imageX = x + width - imgWidth - horizontalMargin;
  } else {
    // Default to left alignment
    imageX = x + horizontalMargin;
  }

  return { x: imageX, y: imageY };
}
