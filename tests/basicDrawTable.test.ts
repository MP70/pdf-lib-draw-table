import { PDFDocument, PDFPage, rgb } from "pdf-lib";
import { drawTable, DrawTableError } from "../src/drawPDFTable";

describe("drawTable", () => {
  let doc: PDFDocument;
  let page: PDFPage;

  beforeEach(async () => {
    doc = await PDFDocument.create();
    page = doc.addPage();
  });

  it("should throw an error when table width exceeds available space", async () => {
    const tableData = [
      ["Header1", "Header2", "Header3"],
      ["Data1", "Data2", "Data3"],
    ];

    const options = {
      column: {
        overrideWidths: [1150, 450, 350], // Override widths to cause overflow
      },
      pageMargin: {
        right: 500,
      },
    };

    try {
      await drawTable(doc, page, tableData, 50, 700, options);
      throw new Error("Table width did not cause an error");
    } catch (err: any) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe(
        "Table width exceeds the available space on the page."
      );
    }
  });

  it("should throw an error when table height exceeds available space", async () => {
    const tableData = [
      ["Header1", "Header2", "Header3"],
      ["Data1", "Data2", "Data3"],
      ["Data4", "Data5", "Data6"],
      ["Data7", "Data8", "Data9"],
    ];

    const options = {
      row: {
        overrideHeights: [150, 450, 350, 550], // Override heights to cause overflow
      },
      pageMargin: {
        bottom: 500,
      },
    };

    try {
      await drawTable(doc, page, tableData, 50, 700, options);
      throw new Error("Table height did not cause an error");
    } catch (err: any) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe(
        "Table height exceeds the available space on the page."
      );
    }
  });

  it("should draw a table with valid input", async () => {
    const tableData = [
      ["Header1", "Header2", "Header3"],
      ["Data1", "Data2", "Data3"],
    ];

    const options = {
      textSize: 14,
      textColour: rgb(0, 0, 0),
      header: {
        hasHeaderRow: true,
        backgroundColor: rgb(0.9, 0.9, 0.9),
      },
      border: {
        width: 1,
        color: rgb(0.8, 0.8, 0.8),
      },
    };

    const tableDimensions = await drawTable(
      doc,
      page,
      tableData,
      50,
      700,
      options
    );

    expect(tableDimensions).toBeDefined();
    expect(tableDimensions).toHaveProperty("endX");
    expect(tableDimensions).toHaveProperty("endY");
    expect(tableDimensions).toHaveProperty("width");
    expect(tableDimensions).toHaveProperty("height");
  });
});
