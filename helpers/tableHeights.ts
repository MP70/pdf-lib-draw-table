import { isCustomStyledText, isImage, isLink, wrapText } from "./util";
import { Link, Image, CellElement, CellContent, CustomStyledText } from "../types";
import { PDFFont } from "pdf-lib";

// Calculate the total height of a table, including the table title
export async function calcTableHeight(
  table: CellContent[][], // Table data
  columnWidths: number[], // Widths of each column
  font: PDFFont, // Default font
  fontSize: number, // Default font size
  lineHeight: number, // Default line height
  hasHeader: boolean, // Whether the table has a header row
  headerFont: PDFFont, // Font for the header row
  headerFontSize: number, // Font size for the header row
  headerLineHeight: number, // Line height for the header row
  tableTitle?: string, // Optional table title
  tableTitleFontSize?: number // Optional font size for the table title
): Promise<number> {
  // Calculate the height of each row in the table
  const rowHeights = await Promise.all(
    table.map((row, rowIndex) =>
      calcRowHeight(
        row,
        columnWidths,
        rowIndex === 0 && hasHeader ? headerFont : font,
        rowIndex === 0 && hasHeader ? headerFontSize : fontSize,
        rowIndex === 0 && hasHeader ? headerLineHeight : lineHeight
      )
    )
  );

  // Calculate the total height of the table by summing up row heights
  const totalHeight = rowHeights.reduce((acc, cur) => acc + cur, 0);
  // Calculate the height of the table title (if present)
  const titleHeight = tableTitle ? (tableTitleFontSize || fontSize) * 2 : 0;

  // Return the total height of the table, including the title
  return totalHeight + titleHeight;
}

// Calculate the height of a single row
export async function calcRowHeight(
  row: CellContent[], // Row data
  columnWidths: number[], // Widths of each column
  font: PDFFont, // Default font
  fontSize: number, // Default font size
  lineHeight: number // Default line height
): Promise<number> {
  // Calculate the wrapped line heights for each cell in the row
  const wrappedLineHeights = await Promise.all(
    row.map(async (cellContent, index) => {
      const maxWidth = columnWidths[index] - 4;

      // Calculate the wrapped line height for a single cell content
      const getContentWrappedLineHeight = (
        content: CellContent,
        maxWidth: number,
        defaultFont: PDFFont,
        defaultFontSize: number
      ): number => {
        if (Array.isArray(content)) {
          // Calculate the max line height for the array of CellElements
          return Math.max(
            ...content.map((innerContent: CellElement) =>
              getContentWrappedLineHeight(innerContent, maxWidth, defaultFont, defaultFontSize)
            )
          );
        } else if (isLink(content) || isCustomStyledText(content)) {
          // Calculate the line height for a link or custom-styled text
          const contentFont = content.font || defaultFont;
          const contentFontSize = content.fontSize || defaultFontSize;
          return wrapText(content.text, maxWidth, contentFont, contentFontSize).length * (contentFontSize * lineHeight);
        } else if (typeof content === "string") {
          // Calculate the line height for a plain text string
          return wrapText(content, maxWidth, defaultFont, defaultFontSize).length * (defaultFontSize * lineHeight);
        } else if (isImage(content)) {
          // Return the height of an image plus a small margin
          return content.height + 2;
        } else {
          // Return the default line height for unsupported content types
          return defaultFontSize * lineHeight;
        }
      };

      // Calculate the wrapped line height for the current cell content
      return getContentWrappedLineHeight(cellContent, maxWidth, font, fontSize);
    })
  );

  // Calculate the maximum line height among all cells in the row
  const maxHeight = Math.max(...wrappedLineHeights);

  // Return the height of the row
  return maxHeight;
}


