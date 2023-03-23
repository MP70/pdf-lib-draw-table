# pdf-lib-draw-table

[![codecov](https://codecov.io/gh/MP70/pdf-lib-draw-table/branch/main/graph/badge.svg?token=BMJ2WXX5EV)](https://codecov.io/gh/MP70/pdf-lib-draw-table)[![Tests](https://github.com/MP70/pdf-lib-draw-table/actions/workflows/runTests.yml/badge.svg)](https://github.com/MP70/pdf-lib-draw-table/actions/workflows/runTests.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-%5E5.0.2-blue)](https://mp70.github.io/pdf-lib-draw-table)
[![MIT License](https://img.shields.io/badge/license-MIT-blue)](https://mp70.github.io/pdf-lib-draw-table)
#### A library for drawing tables in PDFs using pdf-lib.

**Table of Contents**

- [Installation](#installation)
- [Usage](#usage)
- [Example](#example)
- [Documentation](#documentation)
- [License](#license)

## Installation

```sh
npm install pdf-lib-draw-table
```

If you don't already have pdf-lib then

```sh
npm install pdf-lib pdf-lib-draw-table
```

## Example
This is a *very* simple example, this example is server side as we are using fs, but exactly the same code (minus fs!) will also work client side for example in a react component. The options are fairly extensive for both styling and content (https://mp70.github.io/pdf-lib-draw-table/interfaces/DrawTableOptions.html), we just show a couple here. You can also pass us a JSON table(https://mp70.github.io/pdf-lib-draw-table/interfaces/TableObject.html), either that or array as below is fine.
```
import { PDFDocument } from 'pdf-lib';
import { drawTable } from 'pdf-lib-draw-table';
import fs from 'fs';

(async () => {
  // Create a new PDFDocument
  const pdfDoc = await PDFDocument.create();

  // Add a new page
  const page = pdfDoc.addPage([600, 800]);

  // Define the table data
  const tableData = [
    ['Name', 'Age', 'City'],
    ['Alice', '24', 'New York'],
    ['Bob', '30', 'San Francisco'],
    ['Charlie', '22', 'Los Angeles'],
  ];

  // Set the starting X and Y coordinates for the table
  const startX = 50;
  const startY = 750;

  // Set the table options
  const options = {
    header: {
      hasHeaderRow: true,
      backgroundColor: rgb(0.9, 0.9, 0.9),
    },
  };

  try {
    // Draw the table
    const tableDimensions = await drawTable(pdfDoc, page, tableData, startX, startY, options);

    console.log('Table dimensions:', tableDimensions);

    // Serialize the PDF to bytes and write to a file
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('table-example.pdf', pdfBytes);
  } catch (error) {
    console.error('Error drawing table:', error);
  }
})();



```


