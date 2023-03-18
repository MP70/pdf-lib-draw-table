import {
  PDFDocument,
  StandardFonts,
  PDFPage,
  PDFFont,
  rgb,
  Color,
} from "pdf-lib";
export type Alignment = "left" | "center" | "right";
export type ColumnWidthDistOptions = {
  mode: "equal" | "intelligent" | "wrapHeader";
  availableWidth: number;
  tableData: CellContent[][];
  font: PDFFont;
  headerFont?: PDFFont;
  headerFontSize?: number;
  fontSize: number;
  borderWidth: number;
  wrapMargin: number;
  hasHeader: boolean;
};

export interface CustomStyledText {
  type: "text";
  text: string;
  alignment?: Alignment;
  font?: PDFFont;
  fontSize?: number;
  fontColor?: Color;
}
export interface Link {
  type: "link";
  url: string;
  text: string;
  alignment?: Alignment;
  font?: PDFFont;
  fontSize?: number;
  fontColor?: Color;
}
export interface Image {
  type: "image";
  src: string;
  width: number;
  height: number;
  alignment?: Alignment;
  horizontalMargin?: number;
}
export type CellElement = string | Link | Image | CustomStyledText;
export type CellContent = CellElement | Array<CellElement>;

// Basic options for the table, including font, colors, and alignment
interface BasicTableOptions {
  fontSize: number; // Font size for the table text
  font?: PDFFont; // Font for the table text
  textColor?: Color; // Color for the table text
  cellTextAlignment?: Alignment; // alignment tab text
  borderColor?: Color; // Color for the table borders
  borderWidth?: number; // Width of the table borders
  tableTitle?: string; // Title text to display above the table
  tableTitleFontSize?: number; // Font size for the table title
  tableTitleFont?: PDFFont; // Font for the table title
  tableTitleColor?: Color; // Color for the table title
  tableTitleAlignment?: Alignment; // Alignment for the table title
  bottomPageMargin?: number; // Margin between the table and the bottom of the page
  rightPageMargin?: number; // Margin between the table and the right side of the page
  linkColor?: Color; // Default Color for links
  lineHeight?: number; // How much higher should lines be than the text? e.g 1.2 would be a 10% padding to both top and bottom.
  horizontalTextMargin?: number; // Number of points that we sould leave as a margin between the cell boundry and text both left and right 1-3 points is probably sensible in most cases.
}

// Options related to column widths
export type ColumnWidthOptions =
  | {
      overrideColumnWidths?: undefined;
      columnWidthMode: "inteligent";
    }
  | {
      overrideColumnWidths?: undefined;
      columnWidthMode: "equal";
    }
  | {
      overrideColumnWidths?: undefined;
      columnWidthMode: "wrapHeader";
    }
  | {
      overrideColumnWidths: number[];
      columnWidthMode?: undefined;
    };

// Options related to row heights
export interface RowHeightOptions {
  overrideRowHeights?: number[]; // If provided, these heights will be used for each row
}

// Options related to header row styling
export type HeaderRowOptions =
  | {
      hasHeaderRow: true; // If true, the first row will be treated as a header row and styled accordingly
      headerFont?: PDFFont; // Font for the header row
      headerFontSize?: number; // Font size for the header row
      headerBackgroundColor?: Color; // Background color for the header row
      headerTextAlignment?: Alignment; // alignment tab text
      headerTextColor?: Color; // alignment tab text
    }
  | {
      hasHeaderRow?: false; // If false or undefined, there will be no header row
      headerFont?: undefined; // Not allowed when hasHeaderRow is false or undefined
      headerFontSize?: undefined; // Font size for the header row
      headerBackgroundColor?: undefined; // Not allowed when hasHeaderRow is false or undefined
      headerTextAlignment?: undefined; // alignment tab text
      headerTextColor?: undefined; // alignment tab text
    };

// Combine all option types into a single DrawTableOptions type using intersection types
export type DrawTableOptions = BasicTableOptions &
  ColumnWidthOptions &
  RowHeightOptions &
  HeaderRowOptions;

export interface TableDimensions {
  endX: number;
  endY: number;
  width: number;
  height: number;
}
