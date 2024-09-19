import jsPDF from "jspdf";
import { PDFDocument } from "pdf-lib";

export const PdfToImg = async (page: any): Promise<string | undefined> => {
  const desiredDPI = 300;
  const scale = desiredDPI / 72;

  try {
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    return canvas.toDataURL("image/jpeg", 0.7);
  } catch (error) {
    console.error("Error rendering PDF:", error);
  }
};

export const ImgToPdf = async (
  imageDataArray: string[],
  pdfBlob: Blob
): Promise<Blob> => {
  const pdfDoc = await PDFDocument.load(await pdfBlob.arrayBuffer(), { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  const page = pages[0];
  const { width, height } = page.getSize();

  const pdf = new jsPDF({
    unit: "pt",
    compress: true,
    format: [width, height],
  });

  imageDataArray.forEach((imageData, index) => {
    if (index > 0) {
      pdf.addPage();
    }
    pdf.addImage(imageData, "PNG", 0, 0, width, height);
  });

  return pdf.output("blob");
};
