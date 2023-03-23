import { PDFFont, Color, Grayscale, RGB, CMYK } from "pdf-lib";
export type Alignment = "left" | "center" | "right";
export type GenColumnWidthOptions = {
  columnWidthMode: "equal" | "auto" | "wrapHeader";
  availableWidth: number;
  tableData: CellContent[][];
  font: PDFFont;
  headerFont?: PDFFont;
  headerTextSize?: number;
  textSize: number;
  borderWidth: number;
  horizontalMargin: number;
  headerHorizontalMargin: number;
  hasHeader: boolean;
};
export interface CustomStyledText {
  type: "text";
  text: string;
  alignment?: Alignment;
  font?: PDFFont;
  textSize?: number;
  textColor?: Color;
}
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
export type Link = LinkBase &
  (
    | {
        url: string;
      }
    | {
        page: number;
      }
  );
export interface ImageBase {
  type: "image";
  src?: string;
  data?: Uint8Array;
  width: number;
  height: number;
  alignment?: Alignment;
  horizontalMargin?: number;
}
export type Image = ImageBase &
  (
    | {
        src: string;
      }
    | {
        data: Uint8Array;
      }
  );
export type CellElement = string | Link | Image | CustomStyledText;
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
type ColorDeepPartial =
  | DeepPartial<Grayscale>
  | DeepPartial<RGB>
  | DeepPartial<CMYK>;
export type DrawTableOptionsDeepPartial = {
  [K in Exclude<
    keyof DrawTableOptions,
    "textColor" | "linkColor"
  >]?: DeepPartial<DrawTableOptions[K]>;
} & {
  textColor?: ColorDeepPartial;
  linkColor?: ColorDeepPartial;
};
type CompatibleColorPartial = {
  [P in keyof Color]: Color[P] | ColorDeepPartial[P] | undefined;
};
export type CompatibleDrawTableOptions = {
  [K in Exclude<keyof DrawTableOptions, "textColor" | "linkColor">]?:
    | DrawTableOptions[K]
    | DrawTableOptionsDeepPartial[K];
} & {
  textColor?: CompatibleColorPartial;
  linkColor?: CompatibleColorPartial;
};
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? T[P] extends Array<infer U>
      ? Array<DeepPartial<U>>
      : DeepPartial<T[P]>
    : T[P];
};
export interface DrawTableOptions {
  textSize: number;
  textColor: Color;
  contentAlignment: Alignment;
  font: PDFFont;
  linkColor: Color;
  lineHeight: number;
  column: ColumnOptions;
  row: RowOptions;
  header: HeaderOptions;
  title: TitleOptions;
  border: BorderOptions;
  pageMargin: PageMarginOptions;
  contentMargin: ContentMarginOptions;
  fillUndefCells: boolean;
}
export interface HeaderOptions {
  hasHeaderRow: boolean;
  font: PDFFont;
  textSize: number;
  textColor: Color;
  backgroundColor: Color;
  contentAlignment: Alignment;
}
export type ColumnOptions = {
  widthMode: "equal" | "auto" | "wrapHeader";
  overrideWidths: number[];
};
export interface RowOptions {
  overrideHeights: number[];
}
export interface TitleOptions {
  text: string;
  textSize: number;
  font: PDFFont;
  textColor: Color;
  alignment: Alignment;
}
export interface BorderOptions {
  color: Color;
  width: number;
}
export interface PageMarginOptions {
  bottom: number;
  right: number;
}
export interface ContentMarginOptions {
  horizontal: number;
  vertical: number;
}
export interface TableDimensions {
  endX: number;
  endY: number;
  width: number;
  height: number;
}
export {};
