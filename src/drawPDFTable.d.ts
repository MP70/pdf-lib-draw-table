import { PDFDocument, PDFPage } from "pdf-lib";
import {
  CellContent,
  DrawTableOptionsDeepPartial,
  TableDimensions,
  TableObject,
} from "../types";
export declare class DrawTableError extends Error {
  code: string;
  dimensions?: TableDimensions;

  constructor(code: string, message: string, dimensions?: TableDimensions) {
    super(message);
    this.code = code;
    this.name = "DrawTableError";
    this.dimensions = dimensions;
  }
}

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
export declare function drawTable(
  doc: PDFDocument,
  page: PDFPage,
  table: CellContent[][] | TableObject,
  startX: number,
  startY: number,
  userOptions?: DrawTableOptionsDeepPartial,
): Promise<TableDimensions>;
