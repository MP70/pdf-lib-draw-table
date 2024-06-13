// Import your helper functions and types
import { drawTable } from "./drawPDFTable";
import { generateColumnWidths } from "./helpers/columnWidths";
import { calcTableHeight } from "./helpers/tableHeights";
import { DrawTableError } from "./helpers/errorFactory";
import {
  GenColumnWidthOptions,
  CellContent,
  DrawTableOptions,
  HeaderOptions,
  TableDimensions,
  TableObject,
  Alignment,
  CellElement,
  Link,
  Image,
  CustomStyledText,
  BorderOptions,
  ColumnOptions,
  ContentMarginOptions,
  PageMarginOptions,
  RowOptions,
  TitleOptions,
  ImageBase,
  LinkBase,
  ErrorCode,
} from "../types";

// Export your functions and types
export {
  drawTable,
  generateColumnWidths,
  calcTableHeight,
  GenColumnWidthOptions,
  CellContent,
  DrawTableOptions,
  HeaderOptions,
  TableDimensions,
  TableObject,
  Alignment,
  CellElement,
  Link,
  Image,
  CustomStyledText,
  BorderOptions,
  ColumnOptions,
  ContentMarginOptions,
  PageMarginOptions,
  RowOptions,
  TitleOptions,
  ImageBase,
  LinkBase,
  DrawTableError,
  ErrorCode,
};
