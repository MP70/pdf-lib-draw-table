import { isCustomStyledText, isImage, isLink, wrapText } from "./util";
import {
  Link,
  Image,
  CellElement,
  CellContent,
  CustomStyledText,
} from "../../types";
import { PDFFont } from "pdf-lib";

// Calculate the total height of a table, including the table title
export async function calcTableHeight(
  table: CellContent[][], // Table data
  columnWidths: number[], // Widths of each column
  font: PDFFont, // Default font
  textSize: number, // Default font size
  lineHeight: number, // Default line height
  hasHeader: boolean, // Whether the table has a header row
  headerFont: PDFFont, // Font for the header row
  headertextSize: number, // Font size for the header row
  headerLineHeight: number, // Line height for the header row
  horizontalWrapMargin: number, // The horizontal wrap margin for cell content
  verticalMargin: number,
  borderMargin: number,
  tableTitle?: string, // Optional table title
  tableTitletextSize?: number // Optional font size for the table title
): Promise<number> {
  // Calculate the height of each row in the table
  const rowHeights = await Promise.all(
    table.map((row, rowIndex) =>
      calcRowHeight(
        row,
        columnWidths,
        rowIndex === 0 && hasHeader ? headerFont : font,
        rowIndex === 0 && hasHeader ? headertextSize : textSize,
        rowIndex === 0 && hasHeader ? headerLineHeight : lineHeight,
        horizontalWrapMargin,
        verticalMargin,
        borderMargin
      )
    )
  );

  // Calculate the total height of the table by summing up row heights
  const totalHeight = rowHeights.reduce((acc, cur) => acc + cur, 0);
  // Calculate the height of the table title (if present)
  const titleHeight = tableTitle ? (tableTitletextSize || textSize) * 2 : 0;

  // Return the total height of the table, including the title
  return totalHeight + titleHeight;
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
  borderMargin: number
): Promise<number> {
  const wrappedLineHeights = await Promise.all(
    row.map(async (cellContent, index) => {
      const maxWidth =
        columnWidths[index] - borderMargin - horizontalWrapMargin * 2;

      const getContentWrappedLineHeight = (
        content: CellContent,
        maxWidth: number,
        defaultFont: PDFFont,
        defaulttextSize: number
      ): number => {
        if (Array.isArray(content)) {
          return content.reduce((sum, innerContent) => {
            return (
              sum +
              getContentWrappedLineHeight(
                innerContent,
                maxWidth,
                defaultFont,
                defaulttextSize
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
            contenttextSize
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
            defaulttextSize
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
    })
  );

  const maxHeight = Math.max(...wrappedLineHeights);
  return maxHeight;
}
