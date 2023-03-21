import { DrawTableOptions } from "../../types";
import { rgb, PDFFont } from "pdf-lib";

export const setDefaults = (
  embeddedFont: PDFFont,
  embeddedTableTitleFont: PDFFont,
  options: Partial<DrawTableOptions>
): DrawTableOptions => {
  const defaults: DrawTableOptions = {
    textSize: 14,
    textColor: rgb(0, 0, 0),
    contentAlignment: "left",
    font: embeddedFont,
    linkColor: rgb(0, 0, 1),
    lineHeight: 1.36,
    column: {
      widthMode: options.header?.hasHeaderRow ? "auto" : "auto",
      overrideWidths: [],
    },
    row: {
      overrideHeights: [],
    },
    header: {
      hasHeaderRow: true,
      font: embeddedTableTitleFont,
      textSize: 15,
      textColor: rgb(0.996, 0.996, 0.996),
      backgroundColor: rgb(0, 0.2, 0.4),
      contentAlignment: "left",
    },
    title: {
      text: "cake",
      textSize: 12,
      font: embeddedTableTitleFont,
      textColor: rgb(0, 0, 0),
      alignment: "center",
    },
    border: {
      color: rgb(0, 0.2, 0.4),
      width: 1,
    },
    pageMargin: {
      bottom: 5,
      right: 50,
    },
    contentMargin: {
      horizontal: 2,
      vertical: 0,
    },
    fillUndefCells: false,
  };

  return { ...defaults, ...options };
};
