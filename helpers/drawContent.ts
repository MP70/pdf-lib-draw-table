import { PDFPage, PDFName, PDFFont, Color, rgb } from "pdf-lib";
import { CellElement, Alignment, CustomStyledText } from "../types";
import { getTextCoordinates, wrapText, getImageCoordinates } from "./util";
import { fetchImage } from "./images";

export async function drawElement(
  page: PDFPage,
  element: CellElement,
  x: number,
  y: number,
  width: number,
  font: PDFFont,
  fontSize: number,
  color: Color,
  alignment: Alignment,
  linkColor: Color,
  lineHeight: number,
  horizontalTextMargin: number
): Promise<number> {
  try {
    if (typeof element === "string" || element.type === "text") {
      const elem =
        typeof element === "object" && element.type === "text"
          ? element
          : ({ text: element } as CustomStyledText);
      const wrappedText = wrapText(
        elem.text,
        width - 2 * horizontalTextMargin,
        elem.font || font,
        elem.fontSize || fontSize
      );
      let textY = y - (elem.fontSize || fontSize);
      const lineSpacing =
        (elem.font || font).heightAtSize(elem.fontSize || fontSize) *
        lineHeight;

      for (const line of wrappedText) {
        const { x: textX, y: textYCoord } = getTextCoordinates(
          elem.alignment || alignment,
          x,
          width,
          textY,
          horizontalTextMargin
        );
        page.drawText(line, {
          x: textX,
          y: textYCoord,
          size: elem.fontSize || fontSize,
          font: elem.font || font,
          color: elem.fontColor || color,
        });
        textY -= lineSpacing;
      }
      return wrappedText.length * lineSpacing;
    } else if (element.type === "image") {
      const imageData = await fetchImage(element.src);
      const image = await page.doc.embedPng(imageData);
      const scaleFactor = Math.min(
        (width - 2 * (element.horizontalMargin || horizontalTextMargin)) /
          element.width,
        element.height / element.height
      );
      const imgWidth = element.width * scaleFactor;
      const imgHeight = element.height * scaleFactor;

      const { x: imgX, y: imgY } = getImageCoordinates(
        element.alignment || alignment,
        x,
        y,
        width,
        imgHeight,
        imgWidth,
        element.horizontalMargin || horizontalTextMargin
      );

      page.drawImage(image, {
        x: imgX,
        y: imgY,
        width: imgWidth,
        height: imgHeight,
      });

      return imgHeight;
    } else if (element.type === "link") {
      const wrappedText = wrapText(
        element.text,
        width - 2 * horizontalTextMargin,
        element.font || font,
        element.fontSize || fontSize
      );
      let offsetY = element.fontSize || fontSize;
      const lineSpacing =
        (element.font || font).heightAtSize(element.fontSize || fontSize) *
        lineHeight;

      wrappedText.forEach((line) => {
        const width = (element.font || font).widthOfTextAtSize(
          line,
          element.fontSize || fontSize
        );
        const height = (element.font || font).heightAtSize(
          element.fontSize || fontSize
        );

        const { x: textX, y: textYCoord } = getTextCoordinates(
          element.alignment || alignment,
          x,
          width,
          y - offsetY,
          horizontalTextMargin
        );

        page.drawText(line, {
          x: textX,
          y: textYCoord,
          size: element.fontSize || fontSize,
          font: element.font || font,
          color: element.fontColor || linkColor,
        });

        const link = page.doc.context.obj({
          Type: "Annot",
          Subtype: "Link",
          Rect: [textX, textYCoord, textX + width, textYCoord + height],
          Border: [0, 0, 0],
          C: [0, 0, 1],
          A: {
            S: "URI",
            URI: element.url,
          },
        });

        if (!page.node.Annots()) {
          page.node.set(PDFName.of("Annots"), page.doc.context.obj([]));
        }
        page.node.Annots()?.push(link);

        offsetY += lineSpacing;
      });
      return wrappedText.length * lineSpacing;
    }
  } catch (error) {
    console.error("Error drawing element:", error);
  }
  return 0;
}
