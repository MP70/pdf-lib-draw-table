import { DrawTableOptions, TableOptionsDeepPartial } from "../../types";
import { rgb, PDFFont } from "pdf-lib";

export const setDefaults = (
  embeddedFont: PDFFont,
  embeddedTableTitleFont: PDFFont,
  options: TableOptionsDeepPartial<DrawTableOptions>,
): DrawTableOptions => {
  return {
    textSize: options.textSize ?? 14, // Set default text size or use provided value
    textColor: options.textColor ?? rgb(0, 0, 0), // Set default text color or use provided value
    contentAlignment: options.contentAlignment ?? "left", // Set default content alignment or use provided value
    font: options.font ?? embeddedFont, // Set default font or use provided value
    linkColor: options.linkColor ?? rgb(0, 0, 1), // Set default link color or use provided value
    lineHeight: options.lineHeight ?? 1.36, // Set default line height or use provided value
    column: {
      widthMode:
        options.header?.hasHeaderRow ?? false
          ? "equal"
          : options.column?.widthMode ?? "auto", // Set default widthMode to 'equal' if hasHeaderRow is false, otherwise use provided value or 'auto'
      overrideWidths: (options.column?.overrideWidths as number[]) ?? [], // Set default overrideWidths or use provided value
    },
    row: {
      overrideHeights: (options.row?.overrideHeights as number[]) ?? [], // Set default overrideHeights or use provided value
    },
    header: {
      hasHeaderRow: options.header?.hasHeaderRow ?? true, // Set default hasHeaderRow or use provided value
      font: options.header?.font ?? embeddedTableTitleFont, // Set default header font or use provided value
      textSize: options.header?.textSize ?? 14, // Set default header text size or use provided value
      textColor: options.header?.textColor ?? rgb(0.996, 0.996, 0.996), // Set default header text color or use provided value
      backgroundColor: options.header?.backgroundColor ?? rgb(0, 0.2, 0.4), // Set default header background color or use provided value
      contentAlignment: options.header?.contentAlignment ?? "left", // Set default header content alignment or use provided value
    },
    title: {
      text: options.title?.text ?? "", // Set default title text to an empty string or use provided value
      textSize: options.title?.textSize ?? 12, // Set default title text size or use provided value
      font: options.title?.font ?? embeddedTableTitleFont, // Set default title font or use provided value
      textColor: options.title?.textColor ?? rgb(0, 0, 0), // Set default title text color or use provided value
      alignment: options.title?.alignment ?? "center", // Set default title alignment or use provided value
    },
    border: {
      color: options.border?.color ?? rgb(0, 0.2, 0.4), // Set default border color or use provided value
      width: options.border?.width ?? 1, // Set default border width or use provided value
    },
    pageMargin: {
      bottom: options.pageMargin?.bottom ?? 50, // Set default page margin bottom or use provided value
      right: options.pageMargin?.right ?? 50, // Set default page margin right or use provided value
    },
    contentMargin: {
      horizontal: options.contentMargin?.horizontal ?? 3, // Set default content margin horizontal or use provided value
      vertical: options.contentMargin?.vertical ?? 0, // Set default content margin vertical or use provided value
    },
    fillUndefCells: options?.fillUndefCells ?? true,
  };
};
