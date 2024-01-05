import { isCustomStyledText, isImage, isLink, wrapText } from "./util";
import {
  Link,
  Image,
  CellElement,
  CellContent,
  CustomStyledText,
} from "../../types";
import { PDFFont } from "pdf-lib";

/**
 * Calculates the total height of a table and the height of each row.
 * If overrideHeights are provided, it uses them to calculate the total height instead.
 * 
 * @param {CellContent[][]} table - The table data as a 2D array of cell contents.
 * @param {number[]} columnWidths - The widths of each column in the table.
 * @param {PDFFont} font - The default font for table content.
 * @param {number} textSize - The default font size for table content.
 * @param {number} lineHeight - The default line height for table content.
 * @param {boolean} hasHeader - Indicates whether the table has a header row.
 * @param {PDFFont} headerFont - The font for the header row.
 * @param {number} headerTextSize - The font size for the header row.
 * @param {number} headerLineHeight - The line height for the header row.
 * @param {number} horizontalWrapMargin - The horizontal margin for wrapping text in cells.
 * @param {number} verticalMargin - The vertical margin for cells.
 * @param {number} borderMargin - The margin for the border of the table.
 * @param {string} [tableTitle] - The optional title of the table.
 * @param {number} [tableTitleTextSize] - The optional font size for the table title.
 * @param {number[]} [overrideHeights] - Optional array of heights to override the calculated row heights.
 * @returns {Promise<{ totalHeight: number, rowHeights: number[] }>} An object containing the total height of the table and an array of heights for each row.
 */
export async function calcTableHeight(
  table: CellContent[][],
  columnWidths: number[],
  font: PDFFont,
  textSize: number,
  lineHeight: number,
  hasHeader: boolean,
  headerFont: PDFFont,
  headerTextSize: number,
  headerLineHeight: number,
  horizontalWrapMargin: number,
  verticalMargin: number,
  borderMargin: number,
  tableTitle?: string,
  tableTitleTextSize?: number,
  overrideHeights?: number[],
): Promise<{ totalHeight: number, rowHeights: number[] }> {
  let totalHeight = 0;
  let rowHeights: number[];

  if (overrideHeights && overrideHeights.length > 0) {
    totalHeight = overrideHeights.reduce((acc, cur) => acc + cur, 0);
    rowHeights = overrideHeights;
  } else {
    rowHeights = await Promise.all(
      table.map((row, rowIndex) =>
        calcRowHeight(
          row,
          columnWidths,
          rowIndex === 0 && hasHeader ? headerFont : font,
          rowIndex === 0 && hasHeader ? headerTextSize : textSize,
          rowIndex === 0 && hasHeader ? headerLineHeight : lineHeight,
          horizontalWrapMargin,
          verticalMargin,
          borderMargin,
        ),
      ),
    );
    totalHeight = rowHeights.reduce((acc, cur) => acc + cur, 0);
  }

  // Calculate the height of the table title (if present)
  const titleHeight = tableTitle ? (tableTitleTextSize || textSize) * 2 : 0;

  return {
    totalHeight: totalHeight + titleHeight + borderMargin,
    rowHeights: rowHeights
  };
}

// Calculate the height of a single row
export async function calcRowHeight(
  row: CellContent[],
  columnWidths: number[],
  font: PDFFont,
  textSize: number,
  lineHeight: number,
  horizontalWrapMargin: number,
  verticalCellPadding: number,
  borderMargin: number,
): Promise<number> {
  const wrappedLineHeights = await Promise.all(
    row.map(async (cellContent, index) => {
      const maxWidth =
        columnWidths[index] - borderMargin - horizontalWrapMargin * 2;

      const getContentWrappedLineHeight = (
        content: CellContent,
        maxWidth: number,
        defaultFont: PDFFont,
        defaulttextSize: number,
      ): number => {
        if (Array.isArray(content)) {
          return content.reduce((sum, innerContent) => {
            return (
              sum +
              getContentWrappedLineHeight(
                innerContent,
                maxWidth,
                defaultFont,
                defaulttextSize,
              )
            );
          }, 0);
        } else if (isLink(content) || isCustomStyledText(content)) {
          const contentFont = content.font || defaultFont;
          const contenttextSize = content.textSize || defaulttextSize;
          const lines = wrapText(
            content.text,
            maxWidth,
            contentFont,
            contenttextSize,
          );
          return (
            borderMargin +
            verticalCellPadding * 2 +
            lines.length *
              (contentFont.heightAtSize(contenttextSize) * lineHeight)
          );
        } else if (typeof content === "string") {
          const lines = wrapText(
            content,
            maxWidth,
            defaultFont,
            defaulttextSize,
          );
          return (
            borderMargin +
            verticalCellPadding * 2 +
            lines.length *
              (defaultFont.heightAtSize(defaulttextSize) * lineHeight)
          );
        } else if (isImage(content)) {
          return content.height + verticalCellPadding * 2 + borderMargin;
        } else {
          return defaulttextSize * lineHeight;
        }
      };

      return getContentWrappedLineHeight(cellContent, maxWidth, font, textSize);
    }),
  );

  const maxHeight = Math.max(...wrappedLineHeights);
  return maxHeight;
}
