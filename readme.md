# Beta - pdf-lib-draw-table

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
npm install pdf-lib-draw-table-beta
```

If you don't already have pdf-lib then

```sh
npm install pdf-lib pdf-lib-draw-table
```

## Example
This is a *very* simple example (server side as we are using fs). Exactly the same code (minus fs!) will also work client side for example in a react component. The options are fairly extensive for [formatting and styling](https://mp70.github.io/pdf-lib-draw-table/interfaces/DrawTableOptions.html), we just show a couple here. You can also pass us a [JSON table](https://mp70.github.io/pdf-lib-draw-table/interfaces/TableObject.html) if you prefer, either that or array as below is fine. Either can contain any of the following within each cell:
string - As in the example below. This is drawn as wrapped text, no word splitting.
[Image](https://mp70.github.io/pdf-lib-draw-table/types/Image.html),
[Link](https://mp70.github.io/pdf-lib-draw-table/types/Link.html),
[CustomSyledText](https://mp70.github.io/pdf-lib-draw-table/interfaces/CustomStyledText.html)
**OR AN ARRAY OF ANY COMBO OF THE ABOVE**
If you provide an array we automatically put each item on its own line, as such if you need to manually new line text, this is a way of doing that.
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

Massive thanks to [PDF lib](https://github.com/Hopding/pdf-lib) for creating a powerful PDF manipulation library.

Also, big thanks to Typedoc for providing the amazing documentation generator tool that makes /docs: 
https://github.com/TypeStrong/typedoc

