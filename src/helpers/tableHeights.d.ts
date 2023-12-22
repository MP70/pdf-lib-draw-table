import { CellContent } from "../../types";
import { PDFFont } from "pdf-lib";
export declare function calcTableHeight(
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
  tableTitletextSize?: number,
): Promise<number>;
export declare function calcRowHeight(
  row: CellContent[],
  columnWidths: number[],
  font: PDFFont,
  textSize: number,
  lineHeight: number,
  horizontalWrapMargin: number,
  verticalCellPadding: number,
  borderMargin: number,
): Promise<number>;
