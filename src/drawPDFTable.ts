import {
  PDFDocument,
  StandardFonts,
  PDFPage,
  PDFFont,
  rgb,
  Color,
  beginMarkedContent,
  endMarkedContent,
} from "pdf-lib";
import { drawBorder } from "./helpers/util";
import {
  generateUniqueMCID,
  // beginMarkedContent,
  // endMarkedContent
} from "./helpers/markContent";
import { generateColumnWidths } from "./helpers/columnWidths";
import validateAndConvertTableData from "./helpers/validateAndConvert";

import { drawElement } from "./helpers/drawContent";
import {
  CellContent,
  DrawTableOptions,
  ErrorCode,
  TableDimensions,
  TableObject,
  TableOptionsDeepPartial,
} from "../types";
import { calcTableHeight, calcRowHeight } from "./helpers/tableHeights";
import { setDefaults } from "./helpers/setDefaults";
import { createTableError } from "./helpers/errorFactory";
/**
 * Draws a table on the provided PDF document page.
 *
 * @param {PDFDocument} doc - PDF document to draw in
 * @param {PDFPage} page - Page to draw table on
 * @param {CellContent[][] | TableObject} table - 2D array of string data representing the table
 * @param {number} startX - Starting X coordinate for the table
 * @param {number} startY - Starting Y coordinate for the table
 * @param {DrawTableOptions} [options] - Drawing options for the table, including:
 *   @prop {number} [options.textSize] - Font size for table text (default: 16)
 *   @prop {Color} [options.textColour] - Text color for table content (default: rgb(0, 0, 0))
 *   @prop {Alignment} [options.contentAlignment] - Text alignment for table content (default: "left")
 *   @prop {PDFFont} [options.font] - Font for table content (default: embeddedFont)
 *   @prop {Color} [options.linkColour] - Link color for table content (default: rgb(0, 0, 1))
 *   @prop {number} [options.lineHeight] - Line height for table content (default: 1.36)
 *   @prop {ColumnOptions} [options.column] - Column-specific options
 *   @prop {RowOptions} [options.row] - Row-specific options
 *   @prop {HeaderOptions} [options.header] - Header-specific options
 *   @prop {TitleOptions} [options.title] - Title-specific options
 *   @prop {BorderOptions} [options.border] - Border-specific options
 *   @prop {PageMarginOptions} [options.pageMargin] - Page margin options
 *   @prop {ContentMarginOptions} [options.contentMargin] - Content margin options
 * @returns {Promise<TableDimensions>} - The dimensions of the drawn table
 */

export async function drawTable(
  doc: PDFDocument,
  page: PDFPage,
  table: CellContent[][] | TableObject,
  startX: number,
  startY: number,
  options?: TableOptionsDeepPartial<DrawTableOptions> | undefined
): Promise<TableDimensions> {
  const embeddedFont = await doc.embedFont(StandardFonts.Helvetica);
  const embeddedTableTitleFont = await doc.embedFont(
    StandardFonts.HelveticaBold
  );
  // Set defaults for all options
  const defaultOptions: DrawTableOptions = setDefaults(
    embeddedFont,
    embeddedTableTitleFont,
    (options as TableOptionsDeepPartial<DrawTableOptions>) ?? {}
  );
  const {
    fillUndefCells,
    textSize,
    textColor,
    contentAlignment,
    font,
    linkColor,
    lineHeight,
    column,
    row,
    header,
    title,
    border,
    pageMargin,
    contentMargin,
  } = defaultOptions;

  // init empty tabledata
  let tableData: CellContent[][];

  try {
    tableData = await validateAndConvertTableData({
      data: table,
      hasHeader: header.hasHeaderRow!,
      fillEmpty: fillUndefCells,
    });
  } catch (error: any) {
    throw createTableError(
      ErrorCode.ERR_CONVERT_VALIDATE,
      `Error validating or converting table data: ${error.message}`,
    );
  }

  // Check for column count consistency
  if (
    column.overrideWidths.length > 0 &&
    column.overrideWidths.length !== tableData[0].length
  ) {
    throw createTableError(
      ErrorCode.ERR_COLUMN_COUNT_MISMATCH,
      "The number of columns in overrideWidths does not match the number of columns in the table.",
    );
  }

  // Check for row count consistency
  if (
    row?.overrideHeights?.length > 0 &&
    row.overrideHeights?.length !== tableData.length
  ) {
    throw createTableError(
      ErrorCode.ERR_ROW_COUNT_MISMATCH,
      "The number of rows in overrideHeights does not match the number of rows in the table.",
    );
  }

  // Calculate available width and height
  const availableWidth = page.getWidth() - startX - pageMargin.right;
  const availableHeight = startY - pageMargin.bottom;

  // Distribute column widths if not provided, else use overrideWidths
  const columnWidths =
    column.overrideWidths?.length > 0
      ? column.overrideWidths
      : generateColumnWidths({
          columnWidthMode: column?.widthMode,
          availableWidth,
          tableData,
          font,
          textSize,
          borderWidth: border.width,
          hasHeader: header.hasHeaderRow,
          headerFont: header.font,
          headerTextSize: header.hasHeaderRow
            ? header.textSize ?? textSize
            : undefined,
          horizontalMargin: contentMargin.horizontal,
          headerHorizontalMargin: contentMargin.horizontal, // For future feature
        });

  // Calculate table dimensions
  const tableWidth = columnWidths.reduce(
    (acc: number, cur: number) => acc + cur,
    0
  );
  // Check for table width overflow
  if (tableWidth > availableWidth) {
    throw createTableError(
      ErrorCode.ERR_TABLE_WIDTH_OVERFLOW,
      "Table width exceeds the available space on the page.",
      { width: tableWidth, endX: startX + tableWidth }
    );
  }
  const tableHeightDetails = await calcTableHeight(
    tableData,
    columnWidths,
    font,
    textSize,
    lineHeight,
    header.hasHeaderRow,
    header.hasHeaderRow ? header.font : font,
    header.hasHeaderRow ? header.textSize ?? header.textSize : textSize,
    lineHeight, // This is headerLineHeight
    contentMargin.horizontal,
    contentMargin.vertical,
    border.width,
    title.text,
    title.textSize,
    row.overrideHeights 
  );

  // Check for table height overflow
  if (tableHeightDetails.totalHeight > availableHeight) {
    throw createTableError(
      ErrorCode.ERR_TABLE_HEIGHT_OVERFLOW,
      "Table height exceeds the available space on the page.",
      {
        width: tableWidth,
        height: tableHeightDetails.totalHeight,
        endX: startX + tableWidth,
        endY: startY - tableHeightDetails.totalHeight,
      },
      tableHeightDetails.rowHeights
    );
  }

  let currentX = startX;
  let currentY = startY;
  // Draw table title if provided. This is, frankly, a nicety to save the consumer some effort in calling draw text themselves and working out the right X/Y.
  if (title.text) {
    const titleWidth = title.font.widthOfTextAtSize(title.text, title.textSize);
    let titleX = startX;
    if (title.alignment === "center") {
      titleX += (tableWidth - titleWidth) / 2;
    } else if (title.alignment === "right") {
      titleX += tableWidth - titleWidth;
    }

    page.drawText(title.text, {
      x: titleX,
      y: currentY - title.textSize,
      size: title.textSize,
      font: title.font,
      color: title.textColor,
    });

    currentY -= title.textSize * 2;
  }
  //Ok. so it turns out all this time I actually didn't need to make this out of sand... Ooops!
  let markOpen = false;
  try {
    beginMarkedContent("Table");
    markOpen = true;
  } catch (error) {
    console.warn("Error generating MCID or beginning marked content:", error);
  }
  // This is where we actually start to draw the table. As such lets wrap him in a try catch. We want the whole table or none of it and a rejection IMO.

  for (let rowIndex = 0; rowIndex < tableData.length; rowIndex++) {
    // Draw cells, we actually throw the error here, as we can then tell the user what row it failed on..
    try {
      const rowData = tableData[rowIndex];

      const rowHeight =
        row.overrideHeights[rowIndex] ||
        (await calcRowHeight(
          rowData,
          columnWidths,
          rowIndex === 0 && header.hasHeaderRow ? header.font! : font,
          rowIndex === 0 && header.hasHeaderRow ? header.textSize! : textSize,
          lineHeight,
          contentMargin.horizontal,
          contentMargin.vertical,
          border.width
        ));

      const isHeader = rowIndex === 0 && header.hasHeaderRow;
      let cellX = currentX;
      let cellY = currentY;

      for (let colIndex = 0; colIndex < rowData.length; colIndex++) {
        const cellContent = rowData[colIndex];
        const columnWidth = columnWidths[colIndex] || 1;
        const cellFont = isHeader ? header.font : font;
        const cellColor = isHeader ? header.textColor : textColor;
        const cellFontSize = isHeader ? header.textSize : textSize;
        // Determine alignment based on whether the cell is a header or not
        const alignment = isHeader ? header.contentAlignment : contentAlignment;
        let backgroundColor;

        if (isHeader) {
          backgroundColor = header.backgroundColor; // Use the header's background color
        } else {
          // Adjust index for background color when there is a header row
          // This setting is only for non header rows, so index 0 color will be row 0 in a no header table, and row 1 in a header table.
          const adjustedRowIndex = header.hasHeaderRow
            ? rowIndex - 1
            : rowIndex;
          backgroundColor =
            row.backgroundColors &&
            row.backgroundColors.length > adjustedRowIndex
              ? row.backgroundColors[adjustedRowIndex]
              : undefined;
        }

        // Draw cell background if specified
        if (backgroundColor) {
          page.drawRectangle({
            x: cellX,
            y: cellY - rowHeight,
            width: columnWidth,
            height: rowHeight,
            color: backgroundColor,
            borderWidth: border.width,
            borderColor: border.color,
          });
        }

        // Draw cell borders only if there is a positive border width, otherwise, we achieve borderless tables
        if (border.width > 0 && !backgroundColor) {
          // Draw top border of the cell if there is no header and it's the first row
          if (rowIndex === 0 && !header.hasHeaderRow) {
            drawBorder(
              page,
              cellX,
              cellY,
              cellX + columnWidth,
              cellY,
              border.width,
              border.color
            );
          }

          // Draw left border of cell
          drawBorder(
            page,
            cellX,
            cellY,
            cellX,
            cellY - rowHeight,
            border.width,
            border.color
          );

          // Draw right border of the cell if it's the last column
          if (colIndex === rowData.length - 1) {
            drawBorder(
              page,
              cellX + columnWidth,
              cellY,
              cellX + columnWidth,
              cellY - rowHeight,
              border.width,
              border.color
            );
          }

          // Draw bottom border of cell
          drawBorder(
            page,
            cellX,
            cellY - rowHeight,
            cellX + columnWidth,
            cellY - rowHeight,
            border.width,
            border.color
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
              columnWidth - border.width,
              cellFont,
              cellFontSize!,
              cellColor,
              alignment,
              linkColor,
              lineHeight,
              contentMargin.horizontal,
              contentMargin.vertical,
              border.width
            );

            mixedContentY -= contentHeight;
          }
        } else {
          await drawElement(
            page,
            cellContent,
            cellX,
            cellY,
            columnWidth - border.width,
            cellFont,
            cellFontSize!,
            cellColor,
            alignment,
            linkColor,
            lineHeight,
            contentMargin.horizontal,
            contentMargin.vertical,
            border.width
          );
        }

        cellX += columnWidth;
      }

      currentY -= rowHeight;
    } catch (error: any) {
      throw createTableError(
        ErrorCode.DRAW_ROW_ERROR,
        `Failed to draw at ROW-${rowIndex}: ${error.message}`,
      );
    }
  }

  if (markOpen) {
    endMarkedContent();
    markOpen = false;
  }

  // Return table dimensions and end x/y. Useful for consumer if they are writing other content to the PDF page after this.
  return {
    endX: startX + tableWidth,
    endY: startY - tableHeightDetails.totalHeight,
    width: tableWidth,
    height: tableHeightDetails.totalHeight,
  };
}
