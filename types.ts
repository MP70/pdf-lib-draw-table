import {
  PDFDocument,
  StandardFonts,
  PDFPage,
  PDFFont,
  rgb,
  Color,
  Grayscale,
  RGB,
  CMYK,
} from "pdf-lib";

// Alignment options for text elements
export type Alignment = "left" | "center" | "right";

//Currently internal only, nor exposed to the user. 
//Optimal mode will come in a future release, as it needs a bit more testing. May also add a "none" mode.
export enum BreakWordMode {
  Essential = "essential", //DEFAULT ON
  Optimal = "optimal",
}

// Options for distributing column widths in the table
export type GenColumnWidthOptions = {
  columnWidthMode: "equal" | "auto" | "wrapHeader"; // Mode for calculating column widths
  availableWidth: number; // Total width available for the table
  tableData: CellContent[][]; // Data for the table cells
  font: PDFFont; //  PDFFont for table cells
  headerFont?: PDFFont; //  PDFFont for the header row (optional)
  headerTextSize?: number; //  PDFFont size for the header row (optional)
  textSize: number; //  PDFFont size for table cells
  borderWidth: number; // Width of the table borders
  horizontalMargin: number; // Margin for wrapping text within cells
  headerHorizontalMargin: number;
  hasHeader: boolean; // If true, the first row is treated as a header row
};

// Custom styled text with optional font, size, color, and alignment
export interface CustomStyledText {
  type: "text";
  text: string;
  alignment?: Alignment;
  font?: PDFFont;
  textSize?: number;
  textColor?: Color;
}

// Base interface for link elements with optional font, size, color, and alignment
export interface LinkBase {
  type: "link";
  url?: string;
  page?: number;
  text: string;
  alignment?: Alignment;
  font?: PDFFont;
  textSize?: number;
  textColor?: Color;
}

// Enforcing either a 'url' or a 'page' property but not both
export type Link = LinkBase & ({ url: string } | { page: number });

// Base interface for image elements with optional alignment and horizontal margin
export interface ImageBase {
  type: "image";
  src?: string;
  data?: Uint8Array;
  width: number;
  height: number;
  alignment?: Alignment;
  horizontalMargin?: number;
}

// Enforcing either a 'src' or a 'data' property but not both
export type Image = ImageBase & ({ src: string } | { data: Uint8Array });

// Defining a type for cell elements, which can be a string, Link, Image, or CustomStyledText
export type CellElement = string | Link | Image | CustomStyledText;

// Defining a type for cell content, which can be a CellElement or an array of CellElements
export type CellContent = CellElement | Array<CellElement>;

export interface TableObject {
  rows: {
    [key: string]: CellElement[] | undefined;
  }[];
  columns: {
    title: string;
    key: string;
  }[];
}

export interface TableDataConverterValidatorInput {
  data: CellContent[][] | TableObject;
  hasHeader: boolean;
  fillEmpty?: boolean;
}

/**
 * *SPECIAL* DeepPartial type
 *
 * This utility type creates a deep partial version of an existing type, T.
 * It recursively makes all properties of T and its nested objects optional. It also does the same for specifiedFunctions
 */

export type TableOptionsDeepPartial<T> = {
  [K in keyof T]?: T[K] extends (...args: any[]) => any
    ? T[K] | undefined
    : T[K] extends Color
    ? T[K] | undefined
    : T[K] extends PDFFont
    ? T[K] | undefined
    : T[K] extends object
    ? TableOptionsDeepPartial<T[K]>
    : T[K];
};

// Basic options for the table, including font, colors, and alignment
export interface DrawTableOptions {
  textSize: number; //  PDFFont size for the table text
  textColor: Color; // Color for the table text
  contentAlignment: Alignment; // Alignment for the table text
  font: PDFFont; //  PDFFont for the table text
  linkColor: Color; // Default color for links
  lineHeight: number; // Line height for table rows
  column: ColumnOptions; // Options for table columns
  row: RowOptions; // Options for table rows
  header: HeaderOptions; // Options for the header row
  title: TitleOptions; // Options for the table title
  border: BorderOptions; // Options for the table borders
  pageMargin: PageMarginOptions; // Options for the page margins
  contentMargin: ContentMarginOptions; // Options for the content margins
  fillUndefCells: boolean;
}

// Header row options
export interface HeaderOptions {
  hasHeaderRow: boolean; // If true, the first row will be treated as a header row and styled accordingly
  font: PDFFont; //  PDFFont for the header row
  textSize: number; //  PDFFont size for the header row
  textColor: Color; // Text color for the header row
  backgroundColor: Color; // Background color for the header row
  contentAlignment: Alignment; // Alignment for header row content
}

// Options related to column widths
export type ColumnOptions = {
  widthMode: "equal" | "auto" | "wrapHeader"; // Column width mode
  overrideWidths: number[]; // If provided, these widths will be used for each column
};

// Options related to row heights
export interface RowOptions {
  backgroundColors: (Color | undefined)[]; 
  overrideHeights: number[]; // If provided, these heights will be used for each row
}

// Options for the table title
export interface TitleOptions {
  text: string; // Text for the title (optional)
  textSize: number; //  PDFFont size for the title (optional)
  font: PDFFont; //  PDFFont for the title (optional)
  textColor: Color; // Text color for the title (optional)
  alignment: Alignment; // Alignment for the title (optional)
}

// Options for the table borders
export interface BorderOptions {
  color: Color; // Color for the table borders (optional)
  width: number; // Width for the table borders (optional)
}

// Options for the page margins
export interface PageMarginOptions {
  bottom: number; // Bottom page margin (optional)
  right: number; // Right page margin (optional)
}

// Options for the content margins
export interface ContentMarginOptions {
  horizontal: number; // Horizontal content margin (optional)
  vertical: number; // Vertical content margin (optional)
}
// Dimensions of the table
export interface TableDimensions {
  endX: number; // X-coordinate of the table's bottom-right corner
  endY: number; // Y-coordinate of the table's bottom-right corner
  width: number; // Width of the table
  height: number; // Height of the table
}
