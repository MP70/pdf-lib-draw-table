import { DrawTableOptions } from "../../types";
import { PDFFont } from "pdf-lib";
export declare const setDefaults: (
  embeddedFont: PDFFont,
  embeddedTableTitleFont: PDFFont,
  options: Partial<DrawTableOptions>
) => DrawTableOptions;
