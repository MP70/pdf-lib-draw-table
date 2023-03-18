import {
  CellContent,
  ColumnWidthDistOptions,
  CustomStyledText,
  Link,
} from "../types";
import { PDFFont } from "pdf-lib";
import { Image, CellElement } from "../types";
import { isImage, isLink } from "./util";

function getContentWidth(
  content: CellElement,
  font: PDFFont,
  fontSize: number
): number {
  if (
    typeof content === "string" ||
    (content as CustomStyledText).type === "text"
  ) {
    const elem =
      (content as CustomStyledText).type === "text"
        ? (content as CustomStyledText)
        : ({ text: content } as CustomStyledText);
    const usedFont = elem.font || font;
    const usedFontSize = elem.fontSize || fontSize;
    return usedFont.widthOfTextAtSize(elem.text, usedFontSize);
  } else if (content.type === "image") {
    return content.width;
  } else if (content.type === "link") {
    const usedFont = content.font || font;
    const usedFontSize = content.fontSize || fontSize;
    return usedFont.widthOfTextAtSize(content.text, usedFontSize);
  } else {
    throw new Error("Unsupported cell content type");
  }
}

export function distributeColumnWidths(
  options: ColumnWidthDistOptions
): number[] {
  const {
    mode,
    availableWidth,
    tableData,
    font,
    fontSize,
    headerFont,
    headerFontSize,
    borderWidth,
    wrapMargin,
    hasHeader,
  } = options;
  const columnCount = tableData[0].length;

  // Adjust the available width by subtracting the space taken by border widths
  const adjustedWidth = availableWidth - borderWidth * (columnCount + 1);

  // Equal mode: Distribute the available width equally among all columns
  if (mode === "equal") {
    const equalWidth = adjustedWidth / columnCount;
    return Array(columnCount).fill(equalWidth);
  }
  // WrapHeader mode: Adjust column widths based on header content width
  else if (mode === "wrapHeader") {
    if (!hasHeader) {
      // Fall back to "intelligent" mode if no header is present
      return distributeColumnWidths({
        ...options,
        mode: "intelligent",
      });
    }

    // Calculate header widths based on header content and wrap margin
    const headerWidths = tableData[0].map((headerContent: CellContent) => {
      if (Array.isArray(headerContent)) {
        // Header content cell should not be an array (no images or multiline text in headers)
        throw new Error("Header content cell should not be an array");
      }
      const headerWidth =
        getContentWidth(headerContent, headerFont!, headerFontSize!) +
        wrapMargin;
      return headerWidth;
    });

    return headerWidths;
  }
  // Intelligent mode: Calculate column widths based on content widths
  else if (mode === "intelligent") {
    const rowCount = tableData.length;
    const sampleRowCount = Math.min(10, rowCount);

    // Determine maximum text width for each column
    const maxTextWidths = tableData.reduce(
      (widths: number[], row: CellContent[]) => {
        row.forEach((cellContent: CellContent, colIndex: number) => {
          let contentWidth: number;

          if (Array.isArray(cellContent)) {
            // Sum the width of each element in the mixed content cell
            contentWidth = cellContent.reduce(
              (acc: number, content: CellElement) => {
                return acc + getContentWidth(content, font, fontSize);
              },
              0
            );
          } else {
            contentWidth = getContentWidth(cellContent, font, fontSize);
          }

          // Update the maximum width for the current column
          widths[colIndex] = Math.max(widths[colIndex] || 0, contentWidth);
        });

        return widths;
      },
      []
    );

    const totalTextWidth = maxTextWidths.reduce(
      (acc: number, cur: number) => acc + cur,
      0
    );
    // Calculate the scale factor based on adjusted width and total text width
    const scaleFactor = adjustedWidth / totalTextWidth;

    // Scale column widths based on the scaleFactor
    const columnWidths = maxTextWidths.map(
      (width: number) => width * scaleFactor
    );

    // Enforce minimum and maximum column widths
    const minWidth = adjustedWidth / (columnCount * 2);
    const maxWidth = adjustedWidth / columnCount;
    return columnWidths.map((width: number) =>
      Math.max(minWidth, Math.min(width, maxWidth))
    );
  } else {
    throw new Error(
      'ERR_INVALID_DISTRIBUTE_MODE: Invalid distribute mode. Choose "intelligent", "wrapHeader" or "equal".'
    );
  }
}

function getRandomRows<T>(data: T[], maxRows: number, hasHeader: boolean): T[] {
  if (hasHeader) {
    data = data.slice(1);
  }

  if (data.length <= maxRows) {
    return data;
  }

  const randomRows: T[] = [];
  for (let i = 0; i < maxRows; i++) {
    const randomIndex = Math.floor(Math.random() * data.length);
    randomRows.push(data[randomIndex]);
  }

  return randomRows;
}
