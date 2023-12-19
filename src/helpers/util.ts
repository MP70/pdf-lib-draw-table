import { PDFFont, Color, PDFPage } from "pdf-lib";
import {
  Link,
  Image,
  Alignment,
  CustomStyledText,
  CellElement,
} from "../../types";

/* export function isCustomStyledText(content: CellElement): content is CustomStyledText {
  return (content as CustomStyledText).type === "text";
} */
export function isCustomStyledText(content: any): content is CustomStyledText {
  return (content as CustomStyledText).type === "text";
}

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

// Wraps a text into multiple lines based on the maxWidth, font, and textSize provided
export function wrapText(
  text: string,
  maxWidth: number,
  font: PDFFont,
  textSize: number,
  breakWords: boolean = false // future feature
): string[] {
  const words = text.trim().split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const newLine = currentLine === "" ? word : `${currentLine} ${word}`;
    const newLineWidth = font.widthOfTextAtSize(newLine, textSize);

    if (newLineWidth <= maxWidth) {
      currentLine = newLine;
    } else {
      if (breakWords) {
        const brokenWord = breakWord(word, maxWidth, font, textSize);
        const remainingWord = word.slice(brokenWord.length);
        lines.push(`${currentLine} ${brokenWord}`.trim());
        currentLine = remainingWord;
      } else {
        if (currentLine !== "") {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }
  }

  if (currentLine !== "") {
    lines.push(currentLine);
  }

  return lines;
}

function breakWord(
  word: string,
  maxWidth: number,
  font: PDFFont,
  textSize: number
): string {
  let brokenWord = "";
  for (const char of word) {
    const newBrokenWord = `${brokenWord}${char}`;
    const newBrokenWordWidth = font.widthOfTextAtSize(newBrokenWord, textSize);

    if (newBrokenWordWidth <= maxWidth) {
      brokenWord = newBrokenWord;
    } else {
      break;
    }
  }
  return brokenWord;
}

// This function returns the x and y coordinates for placing text based on the provided alignment, cell position, and dimensions.
/**
 * Get the text coordinates for a cell based on alignment, position, and dimensions.
 *
 * @param align - Alignment of the text within the cell ("left", "center", or "right").
 * @param cellX - X coordinate of the cell.
 * @param textY - Y coordinate of the text.
 * @param horizontalMargin - Margin left and right of the text.
 */
export function getTextCoordinates(
  align: Alignment = "left",
  cellX: number,
  textY: number,
  horizontalMargin: number,
  verticalMargin: number,
  cellWidth: number,
  textWidth: number,
  borderWidth: number
): { x: number; y: number } {
  //init x
  let x: number;

  // Calculate the x coordinate based on the alignment
  if (align === "center") {
    x = cellX + cellWidth / 2 - textWidth / 2;
  } else if (align === "right") {
    x = cellX + cellWidth - textWidth - horizontalMargin;
  } else {
    // Default to left alignment
    x = cellX + horizontalMargin;
  }

  //Calc the Y position based on margins and border width..
  const y = textY - (verticalMargin + Math.floor(borderWidth / 2));
  return { x, y };
}

// This function returns the x and y coordinates for placing an image based on the provided alignment, cell position, and dimensions.
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

  // Calculate the x coordinate based on the alignment
  if (align === "center") {
    imageX = x + (width - imgWidth) / 2;
  } else if (align === "right") {
    imageX = x + width - imgWidth - horizontalMargin;
  } else {
    // Default to left alignment
    imageX = x + horizontalMargin;
  }
  const yOut = imageY;

  return { x: imageX, y: yOut };
}
