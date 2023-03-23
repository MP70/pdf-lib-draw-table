import { TableDataConverterValidatorInput, CellContent } from "../../types";
declare function validateAndConvertTableData(
  input: TableDataConverterValidatorInput
): Promise<CellContent[][]>;
export default validateAndConvertTableData;
