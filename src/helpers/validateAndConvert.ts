import {
  TableDataConverterValidatorInput,
  TableObject,
  CellContent,
} from "../../types";

async function validateAndConvertTableData(
  input: TableDataConverterValidatorInput,
): Promise<CellContent[][]> {
  return new Promise((resolve, reject) => {
    const { data, hasHeader, fillEmpty } = input;

    if (!Array.isArray(data) && typeof data !== "object") {
      reject(new Error("Unable to convert TableObject to CellContent."));
    }

    const isTableObject = (
      data: CellContent[][] | TableObject,
    ): data is TableObject => "columns" in data && "rows" in data;

    const convertTableObjectToCellContentArray = (
      tableObject: TableObject,
    ): CellContent[][] => {
      const cellContentArray: CellContent[][] = [];

      for (const row of tableObject.rows) {
        const rowData: CellContent[] = [];

        for (const column of tableObject.columns) {
          const cell = row[column.key];
          if (cell) {
            rowData.push(cell);
          }
        }
        cellContentArray.push(rowData);
      }

      return cellContentArray;
    };

    const getMaxRowLength = (table: CellContent[][]): number =>
      table.reduce((max, row) => Math.max(max, row.length), 0);

    const validateAndFill = (table: CellContent[][]): CellContent[][] => {
      const maxRowLength = getMaxRowLength(hasHeader ? table.slice(1) : table);
      const headerRowLength = hasHeader ? table[0].length : maxRowLength;

      if (headerRowLength < maxRowLength) {
        reject(new Error("Header row has fewer cells than other rows."));
      }

      const filledTable = table.map((row, index) => {
        if (row.length > headerRowLength) {
          reject(
            new Error(`Row ${index + 1} has more cells than the header row.`),
          );
        }

        if (fillEmpty) {
          return row.concat(new Array(headerRowLength - row.length).fill(""));
        } else if (row.length < headerRowLength) {
          reject(
            new Error(`Row ${index + 1} has fewer cells than the header row.`),
          );
        }

        return row;
      });

      return filledTable;
    };

    const cellContentArray = isTableObject(data)
      ? convertTableObjectToCellContentArray(data)
      : data;
    const validatedAndFilledTable = validateAndFill(cellContentArray);

    resolve(validatedAndFilledTable);
  });
}

export default validateAndConvertTableData;
