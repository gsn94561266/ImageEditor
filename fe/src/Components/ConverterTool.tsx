import jsPDF from 'jspdf';
import { PDFDocument } from 'pdf-lib';

export const PdfToImg = async (page: any): Promise<string | undefined> => {
  const desiredDPI = 300;
  const scale = desiredDPI / 72;

  try {
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    return canvas.toDataURL('image/jpeg', 0.7);
  } catch (error) {
    console.error('Error rendering PDF:', error);
  }
};

export const ImgToPdf = async (
  imageDataArray: string[],
  pdfBlob: Blob
): Promise<Blob> => {
  const pdfDoc = await PDFDocument.load(await pdfBlob.arrayBuffer());
  const pages = pdfDoc.getPages();

  const page = pages[0];
  const { width, height } = page.getSize();

  const pdf = new jsPDF({
    unit: 'pt',
    compress: true,
    format: [width, height],
  });

  imageDataArray.forEach((imageData, index) => {
    const page = pages[index];
    const { width, height } = page.getSize();

    if (index > 0) {
      if (width > height) {
        pdf.addPage([width, height], 'l');
      } else {
        pdf.addPage([width, height], 'p');
      }
    }
    pdf.addImage(imageData, 'PNG', 0, 0, width, height);
  });

  return pdf.output('blob');
};

export const DataURLToBlob = (dataURL: string): Blob => {
  const [header, data] = dataURL.split(',');
  const byteString = atob(data);
  const mimeString = header.split(':')[1].split(';')[0];
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const intArray = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    intArray[i] = byteString.charCodeAt(i);
  }

  return new Blob([intArray], { type: mimeString });
};
