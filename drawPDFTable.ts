import {
  PDFDocument,
  StandardFonts,
  PDFPage,
  PDFFont,
  rgb,
  Color,
} from "pdf-lib";
import { drawBorder } from "./helpers/util";
import { generateUniqueMCID, beginMarkedContent } from "./helpers/markContent";
import { distributeColumnWidths } from "./helpers/columnWidths";
import { drawElement } from "./helpers/drawContent";
import { CellContent, DrawTableOptions, TableDimensions } from "./types";
import { calcTableHeight, calcRowHeight } from "./helpers/tableHeights";
class DrawTableError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "DrawTableError";
  }
}

/**
 * Draws a table on the provided PDF document page.
 *
 * @param doc PDF document to draw in
 * @param page page to draw table on.
 * @param tableData 2D array of string data representing the table
 * @param startX starting X coordinate for the table
 * @param startY starting Y coordinate for the table
 * @param options drawing options for the table
 * @returns the dimensions of the drawn table
 */
export async function drawTable(
  doc: PDFDocument,
  page: PDFPage,
  tableData: CellContent[][],
  startX: number,
  startY: number,
  options?: DrawTableOptions
): Promise<TableDimensions> {
  const embeddedFont = await doc.embedFont(StandardFonts.Helvetica);
  const embeddedTableTitleFont = await doc.embedFont(
    StandardFonts.HelveticaBold
  );

  // Set the default options for the table
  // Merge user-specified options with default options
  // Set default values for all properties in DrawTableOptions
  const {
    overrideColumnWidths = [],
    columnWidthMode = overrideColumnWidths.length === 0
      ? options?.columnWidthMode ?? "tight"
      : undefined, // Default to 'tight' mode
    overrideRowHeights = [],
    fontSize = 12,
    font = embeddedFont,
    cellTextAlignment = "left",
    headerTextAlignment = "center",
    textColor = rgb(0, 0, 0),
    headerTextColor = textColor,
    borderColor = rgb(0, 0, 0),
    borderWidth = 1,
    hasHeaderRow = false,
    headerFont = hasHeaderRow
      ? options?.headerFont ?? embeddedTableTitleFont
      : undefined,
    headerBackgroundColor = hasHeaderRow
      ? options?.headerBackgroundColor ?? rgb(0.9, 0.9, 0.9)
      : undefined,
    headerFontSize = hasHeaderRow
      ? options?.headerFontSize ?? fontSize
      : undefined,
    tableTitle = undefined,
    tableTitleFontSize = 12,
    tableTitleFont = embeddedTableTitleFont,
    tableTitleColor = rgb(0, 0, 0),
    tableTitleAlignment = "center",
    bottomPageMargin = 5,
    rightPageMargin = 5,
    linkColor = rgb(0, 0, 1),
    lineHeight = 1.1,
    horizontalTextMargin = 1,
  } = options ?? ({} as DrawTableOptions);

  // Check for column count consistency
  if (
    overrideColumnWidths.length > 0 &&
    overrideColumnWidths.length !== tableData[0].length
  ) {
    throw new DrawTableError(
      "ERR_COLUMN_COUNT_MISMATCH",
      "The number of columns in overrideColumnWidths does not match the number of columns in the table."
    );
  }

  // Check for row count consistency
  if (
    overrideRowHeights.length > 0 &&
    overrideRowHeights.length !== tableData.length
  ) {
    throw new DrawTableError(
      "ERR_ROW_COUNT_MISMATCH",
      "The number of rows in overrideRowHeights does not match the number of rows in the table."
    );
  }

  // Calculate available width and height
  const availableWidth = page.getWidth() - startX - rightPageMargin;
  const availableHeight = startY - bottomPageMargin;

  // Distribute column widths if not provided, else use overrideColumnWidths
  const columnWidths =
    overrideColumnWidths.length > 0
      ? overrideColumnWidths
      : distributeColumnWidths({
          mode: "intelligent",
          availableWidth,
          tableData,
          font,
          fontSize,
          borderWidth,
          hasHeader: hasHeaderRow,
          headerFont: headerFont,
          headerFontSize: headerFontSize,
          wrapMargin: 0,
        });

  // Calculate table dimensions
  const tableWidth = columnWidths.reduce(
    (acc: number, cur: number) => acc + cur,
    0
  );
  const tableHeight = await calcTableHeight(
    tableData,
    columnWidths,
    font,
    fontSize,
    lineHeight,
    hasHeaderRow,
    headerFont!,
    headerFontSize!,
    lineHeight, // headerLineHeight (assuming same as above for now, here for future functonality.)
    tableTitle,
    tableTitleFontSize
  );

  //Check we are safe to continue on (or if the consumer needs to give us more x/y space or a new page).
  // Check for table width overflow
  if (tableWidth > availableWidth) {
    throw new DrawTableError(
      "ERR_TABLE_WIDTH_OVERFLOW",
      "Table width exceeds the available space on the page."
    );
  }

  // Check for table height overflow
  if (tableHeight > availableHeight) {
    throw new DrawTableError(
      "ERR_TABLE_HEIGHT_OVERFLOW",
      "Table height exceeds the available space on the page."
    );
  }

  let currentX = startX;
  let currentY = startY;

  // Draw table title if provided. This is, frankly, a nicety to save the consumer some effort in calling draw text themselves and working out the right X/Y.
  if (tableTitle) {
    const titleWidth = tableTitleFont.widthOfTextAtSize(
      tableTitle,
      tableTitleFontSize
    );
    let titleX = startX;
    if (tableTitleAlignment === "center") {
      titleX += (tableWidth - titleWidth) / 2;
    } else if (tableTitleAlignment === "right") {
      titleX += tableWidth - titleWidth;
    }

    page.drawText(tableTitle, {
      x: titleX,
      y: currentY - tableTitleFontSize,
      size: tableTitleFontSize,
      font: tableTitleFont,
      color: tableTitleColor,
    });

    currentY -= tableTitleFontSize * 2;
  }

  // This is where we actually start to draw the table. As such lets wrap him in a try catch. We want the whole table or none of it and a rejection IMO.
  for (let rowIndex = 0; rowIndex < tableData.length; rowIndex++) {
    const rowData = tableData[rowIndex];

    const rowHeight =
      overrideRowHeights[rowIndex] ||
      (await calcRowHeight(
        rowData,
        columnWidths,
        rowIndex === 0 && hasHeaderRow ? headerFont! : font,
        rowIndex === 0 && hasHeaderRow ? headerFontSize! : fontSize,
        lineHeight
      ));

    const isHeader = rowIndex === 0 && hasHeaderRow;
    let cellX = currentX;
    let cellY = currentY;

    //Optomiscally set begining of the Marked Table (if we fail, then meh, we continue anyways rather than hard error)
    let beginMarkedContentOp = "";

    try {
      const mcid = await generateUniqueMCID(doc);
      beginMarkedContentOp = await beginMarkedContent(doc, mcid);
    } catch (error) {
      console.warn("Error generating MCID or beginning marked content:", error);
    }

    if (beginMarkedContentOp.length > 0) {
      page.drawText(beginMarkedContentOp);
    }

    // Draw cells
    try {
      for (let colIndex = 0; colIndex < rowData.length; colIndex++) {
        const cellContent = rowData[colIndex];
        const columnWidth = columnWidths[colIndex] || 1;
        const cellFont = isHeader ? embeddedTableTitleFont : font;
        const cellColor = isHeader ? headerTextColor : textColor;
        const cellFontSize = isHeader ? headerFontSize : fontSize;
        // Determine alignment based on whether the cell is a header or not
        const alignment = isHeader ? headerTextAlignment : cellTextAlignment;

        // Draw cell background for header row
        if (isHeader) {
          page.drawRectangle({
            x: cellX,
            y: cellY - rowHeight,
            width: columnWidth,
            height: rowHeight,
            color: headerBackgroundColor,
            borderWidth: borderWidth,
            borderColor: borderColor,
          });
        }

        // Draw cell borders only if there is a positive border width, otherwise, we achieve borderless tables
        if (borderWidth > 0) {
          // Draw top border of the cell if there is no header and it's the first row
          if (rowIndex === 0 && !hasHeaderRow) {
            drawBorder(
              page,
              cellX,
              cellY,
              cellX + columnWidth,
              cellY,
              borderWidth,
              borderColor
            );
          }

          // Draw left border of cell
          drawBorder(
            page,
            cellX,
            cellY,
            cellX,
            cellY - rowHeight,
            borderWidth,
            borderColor
          );

          // Draw right border of the cell if it's the last column
          if (colIndex === rowData.length - 1) {
            drawBorder(
              page,
              cellX + columnWidth,
              cellY,
              cellX + columnWidth,
              cellY - rowHeight,
              borderWidth,
              borderColor
            );
          }

          // Draw bottom border of cell
          drawBorder(
            page,
            cellX,
            cellY - rowHeight,
            cellX + columnWidth,
            cellY - rowHeight,
            borderWidth,
            borderColor
          );
        }

        // Draw cell text
        if (Array.isArray(cellContent)) {
          let mixedContentY = cellY;
          for (const element of cellContent) {
            const contentHeight = await drawElement(
              page,
              element,
              cellX,
              mixedContentY,
              columnWidth,
              cellFont,
              cellFontSize!,
              cellColor,
              alignment,
              linkColor,
              lineHeight,
              horizontalTextMargin
            );
            mixedContentY -= contentHeight;
          }
        } else {
          await drawElement(
            page,
            cellContent,
            cellX,
            cellY,
            columnWidth,
            cellFont,
            cellFontSize!,
            cellColor,
            alignment,
            linkColor,
            lineHeight,
            horizontalTextMargin
          );
        }

        cellX += columnWidth;
      }

      currentY -= rowHeight;
    } catch (error: any) {
      throw new DrawTableError(
        "DRAW_TABLE_ERROR",
        `Failed to draw the table: ${error.message}`
      );
    }
  }
  // Return table dimensions and end x/y. Useful for consumer if they are writing other content to the PDF page after this.
  return {
    endX: startX + tableWidth,
    endY: startY + tableHeight,
    width: tableWidth,
    height: tableHeight,
  };
}
