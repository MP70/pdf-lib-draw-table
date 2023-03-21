import {
  CellContent,
  GenColumnWidthOptions,
  CustomStyledText,
  Link,
} from "../../types";
import { PDFFont } from "pdf-lib";
import { Image, CellElement } from "../../types";
import { isImage, isLink } from "./util";
import { DrawTableError } from "../drawPDFTable";

/**
 * Get the width of the content based on its type.
 * @param {CellElement} content - The content of the cell.
 * @param {PDFFont} font - The font to be used for the content.
 * @param {number} textSize - The size of the text.
 * @returns {number} - The width of the content.
 */
function getContentWidth(
  content: CellElement,
  font: PDFFont,
  textSize: number
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
    const usedtextSize = elem.textSize || textSize;
    return usedFont.widthOfTextAtSize(elem.text, usedtextSize);
  } else if (content.type === "image") {
    return content.width;
  } else if (content.type === "link") {
    const usedFont = content.font || font;
    const usedtextSize = content.textSize || textSize;
    return usedFont.widthOfTextAtSize(content.text, usedtextSize);
  } else {
    throw new Error("Unsupported cell content type");
  }
}

/**
 * Calculate the widths of the headers.
 * @param {CellContent[]} headers - The header contents.
 * @param {PDFFont} headerFont - The font to be used for the headers.
 * @param {number} headertextSize - The size of the header text.
 * @param {number} headerHorizontalMargin - The wrap margin for the header cells.
 * @param {number} borderWidth - The border width.
 * @returns {number[]} - The widths of the headers.
 */
function calculateHeaderWidths(
  headers: CellContent[],
  headerFont: PDFFont,
  headertextSize: number,
  headerHorizontalMargin: number,
  borderWidth: number
): number[] {
  return headers.map((headerContent: CellContent) => {
    if (Array.isArray(headerContent)) {
      throw new Error("Header content cell should not be an array");
    }
    const headerWidth =
      getContentWidth(headerContent, headerFont, headertextSize) +
      headerHorizontalMargin * 2;
    return headerWidth;
  });
}

/**
 * Generate/Distribute the column widths based on the given options.
 * @param {GenColumnWidthOptions} options - The options for Generating/Distributing the column widths.
 * @returns {number[]} - The output column widths.
 */
export function generateColumnWidths(options: GenColumnWidthOptions): number[] {
  const {
    columnWidthMode,
    availableWidth,
    tableData,
    font,
    textSize,
    headerFont,
    headerTextSize,
    borderWidth,
    horizontalMargin,
    headerHorizontalMargin, // Added separate horizontalMargin for header cells
    hasHeader,
  } = options;
  const columnCount = tableData[0].length;

  // We get the chance to further adjust as needed.
  const adjustedWidth = availableWidth;

  if (columnWidthMode === "equal") {
    const equalWidth = adjustedWidth / columnCount;
    return Array(columnCount).fill(equalWidth);
  } else if (columnWidthMode === "wrapHeader" || columnWidthMode === "auto") {
    let headerWidths = Array(columnCount).fill(0);
    if (hasHeader) {
      headerWidths = calculateHeaderWidths(
        tableData[0],
        headerFont!,
        headerTextSize!,
        headerHorizontalMargin, // Use headerHorizontalMargin instead of horizontalMargin
        borderWidth
      );
    }
    if (columnWidthMode === "wrapHeader") {
      if (!hasHeader) {
        throw new DrawTableError(
          "ERR_WRAP_HEADER_INVALID",
          `Failed to draw, wrap header not valid when no header set `
        );
      }
      return headerWidths;
    } else {
      const rowCount = tableData.length;
      const sampleRowCount = Math.min(10, rowCount);

      const maxTextWidths = tableData.reduce(
        (widths: number[], row: CellContent[]) => {
          row.forEach((cellContent: CellContent, colIndex: number) => {
            let contentWidth: number;

            if (Array.isArray(cellContent)) {
              contentWidth = cellContent.reduce(
                (acc: number, content: CellElement) => {
                  return (
                    acc +
                    getContentWidth(content, font, textSize) +
                    horizontalMargin * 2 +
                    borderWidth
                  );
                },
                0
              );
            } else {
              contentWidth =
                getContentWidth(cellContent, font, textSize) +
                horizontalMargin * 2 +
                borderWidth;
            }

            widths[colIndex] = Math.max(
              widths[colIndex] || 0,
              contentWidth,
              headerWidths[colIndex]
            );
          });

          return widths;
        },
        []
      );

      let columnWidths = maxTextWidths.map((width: number) => width);

      const contentTotalWidth = columnWidths.reduce((acc, cur) => acc + cur, 0);
      const headerTotalWidth = headerWidths.reduce((acc, cur) => acc + cur, 0);
      const totalWidth = Math.max(contentTotalWidth, headerTotalWidth);

      if (totalWidth > availableWidth) {
        if (headerTotalWidth >= availableWidth) {
          const scaleFactor = adjustedWidth / headerTotalWidth;
          if (scaleFactor < 0.9) {
            throw new DrawTableError(
              "ERR_NO_SPACE_FOR_HEADERS",
              `Drawing this would require us to squish the headers too much (<90%). Please choose equal, give us more page width, or manually set col widths.`
            );
          }
          columnWidths = columnWidths.map((width, index) =>
            Math.floor(headerWidths[index] * scaleFactor)
          );
        } else {
          const scaleFactor =
            (adjustedWidth - headerTotalWidth) /
            (totalWidth - headerTotalWidth);
          const newContentWidths = columnWidths.map(
            (width) => width * scaleFactor
          );

          columnWidths = columnWidths.map((width, index) =>
            Math.max(headerWidths[index], newContentWidths[index])
          );

          const newTotalWidth = columnWidths.reduce((acc, cur) => acc + cur, 0);
          if (newTotalWidth < adjustedWidth) {
            const widthDiff = adjustedWidth - newTotalWidth;
            const widthIncrement = widthDiff / columnCount;
            columnWidths = columnWidths.map((width) => width + widthIncrement);
          }
        }
      } else {
        columnWidths = columnWidths.map((width, index) =>
          Math.max(width, headerWidths[index])
        );
      }

      return columnWidths;
    }
  } else {
    throw new DrawTableError(
      "ERR_INVALID_DISTRIBUTE_MODE",
      'Invalid distribute mode. Choose "auto", "wrapHeader" or "equal".'
    );
  }
}
