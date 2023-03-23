# pdf-lib-draw-table

[![codecov](https://codecov.io/gh/MP70/pdf-lib-draw-table/branch/main/graph/badge.svg?token=BMJ2WXX5EV)](https://codecov.io/gh/MP70/pdf-lib-draw-table)[![Tests](https://github.com/MP70/pdf-lib-draw-table/actions/workflows/runTests.yml/badge.svg)](https://github.com/MP70/pdf-lib-draw-table/actions/workflows/runTests.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-%5E5.0.2-blue)](https://mp70.github.io/pdf-lib-draw-table)
[![MIT License](https://img.shields.io/badge/license-MIT-blue)](https://mp70.github.io/pdf-lib-draw-table)
A library for drawing tables in PDFs using pdf-lib.

**Table of Contents**

- [Installation](#installation)
- [Usage](#usage)
- [Example](#example)
- [Documentation](#documentation)
- [License](#license)

## Installation

```
sh
npm install pdf-lib-draw-table
```

If you don't already have pdf-lib then

```
sh
npm install pdf-lib pdf-lib-draw-table
```

## Usage

```
import { PDFDocument } from "pdf-lib";

// Import helper functions and types for drawing the table
import { drawTable, DrawTableOptions, CellContent } from "pdf-lib-draw-table";

// Main function to create and draw a table in a PDF document
async function createTableInPDF() {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Add a new page to the document
  const page = pdfDoc.addPage([600, 400]);

  // Define table data
  const tableData: CellContent[][] = [
    ["Header 1", "Header 2", "Header 3"],
    ["Row 1, Col 1", "Row 1, Col 2", "Row 1, Col 3"],
    ["Row 2, Col 1", "Row 2, Col 2", "Row 2, Col 3"],
  ];

  // Set up options for drawing the table


```

## Example
