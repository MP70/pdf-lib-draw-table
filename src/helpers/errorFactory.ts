import { ErrorCode, TableDimensions } from "../../types";

export class DrawTableError extends Error {
  code: ErrorCode;
  dimensions?: Partial<TableDimensions>;
  rowHeights?: number[];

  constructor(
    code: ErrorCode,
    message: string,
    dimensions?: Partial<TableDimensions>,
    rowHeights?: number[]
  ) {
    super(message);
    this.code = code;
    this.name = "DrawTableError";
    this.dimensions = dimensions;
    this.rowHeights = rowHeights;
  }
}

export function createTableError(
  code: ErrorCode,
  message: string,
  dimensions?: Partial<TableDimensions>,
  rowHeights?: number[]
): DrawTableError {
  return new DrawTableError(code, message, dimensions, rowHeights);
}
