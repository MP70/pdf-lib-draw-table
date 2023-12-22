import { PDFFont, Color, PDFPage } from "pdf-lib";
import {
  Link,
  Image,
  Alignment,
  CustomStyledText,
  CellElement,
  BreakWordMode,
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
  borderColor: Color,
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

export function wrapText(
  text: string,
  maxWidth: number,
  font: PDFFont,
  textSize: number,
  breakWords: boolean = true,
): string[] {
  const words = text.trim().split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const wordWidth = font.widthOfTextAtSize(word, textSize);

    if (breakWords && wordWidth > maxWidth) {
      const brokenWords = breakWord(word, maxWidth, font, textSize);
      if (brokenWords.length > 1 && brokenWords[1].length > 1) {
        // Break the word and add a hyphen at the beginning of the new line part
        if (currentLine !== "") {
          lines.push(currentLine);
        }
        lines.push(brokenWords[0]);
        currentLine = `-${brokenWords[1]}`;
      } else {
        // Move the word to a new line if it cannot be broken properly
        if (currentLine !== "") {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    } else {
      const newLine = currentLine === "" ? word : `${currentLine} ${word}`;
      const newLineWidth = font.widthOfTextAtSize(newLine, textSize);

      if (newLineWidth <= maxWidth) {
        currentLine = newLine;
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
  textSize: number,
): string[] {
  const brokenWords: string[] = [];
  let currentWord = "";

  for (const char of word) {
    const testWord = currentWord + char;
    const testWordWidth = font.widthOfTextAtSize(testWord, textSize);

    if (testWordWidth > maxWidth) {
      if (currentWord.length < 3) {
        // Avoid breaking into very small parts
        return [word];
      }
      brokenWords.push(currentWord);
      currentWord = char;
    } else {
      currentWord = testWord;
    }
  }

  if (currentWord !== "" && currentWord.length > 1) {
    brokenWords.push(currentWord);
  } else {
    // Avoid breaking the word if it results in a very short segment
    return [word];
  }

  return brokenWords;
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
  borderWidth: number,
): { x: number; y: number } {
  let x: number;

  // Calculate the x coordinate based on the alignment
  if (align === "center") {
    x = cellX + (cellWidth / 2 + borderWidth / 2) - textWidth / 2;
  } else if (align === "right") {
    x = cellX + cellWidth + borderWidth / 2 - (textWidth + horizontalMargin);
  } else {
    // Default to left alignment
    x = cellX + horizontalMargin + borderWidth / 2;
  }

  // Calculate the Y position based on margins and border width
  const y = textY - verticalMargin - borderWidth / 2;
  return { x, y };
}

// This function returns the x and y coordinates for placing an image based on the provided alignment, cell position, and dimensions.
export function getImageCoordinates(
  align: Alignment,
  cellX: number,
  y: number,
  cellWidth: number,
  imgWidth: number,
  imgHeight: number,
  horizontalMargin: number = 0,
  borderWidth: number = 0, // Set default value to 0
): { x: number; y: number } {
  let imageX: number;
  let imageY: number = y - imgHeight;

  // Calculate the x coordinate based on the alignment
  if (align === "center") {
    imageX = cellX + (cellWidth / 2 + borderWidth / 2) - imgWidth / 2;
  } else if (align === "right") {
    imageX =
      cellX + cellWidth + borderWidth / 2 - (imgWidth + horizontalMargin);
  } else {
    // Default to left alignment
    imageX = cellX + horizontalMargin + borderWidth / 2;
  }
  const yOut = imageY;

  return { x: imageX, y: yOut };
}
