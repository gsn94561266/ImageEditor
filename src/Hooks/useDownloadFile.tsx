import { useState, useCallback } from "react";
import { ImgToPdf } from "../Components/PdfConversion";
import { DataURLToBlob } from "../Components/DataURLToBlob";
import { format } from "date-fns";

const createAndClickLink = (url: string, filename: string) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const useDownloadFile = (
  instance: any,
  selectedPage: number,
  pdfData: Blob,
  imageData: string[],
  fileType: string,
  setErrorMessage: (message: string) => void
) => {
  const [downloadLoading, setDownloadLoading] = useState(false);

  const handleDownload = useCallback(async () => {
    setDownloadLoading(true);

    try {
      if (!instance) throw new Error("Editor instance not initialized");

      instance.resetZoom();
      const dataURL = instance.toDataURL();
      const filename = `${format(new Date(), "yyyyMMdd_HHmmss")}.${fileType}`;

      if (fileType === "pdf") {
        if (imageData[selectedPage - 1] !== dataURL) {
          imageData[selectedPage - 1] = dataURL;
        }

        const pdfBlob = await ImgToPdf(imageData, pdfData);
        const downloadUrl = URL.createObjectURL(pdfBlob);
        createAndClickLink(downloadUrl, filename);
      } else if (fileType === "jpg" || fileType === "png") {
        const blob = DataURLToBlob(dataURL);
        const downloadUrl = URL.createObjectURL(blob);
        createAndClickLink(downloadUrl, filename);
      } else {
        throw new Error("Unsupported file type for download.");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      setErrorMessage((error as Error).message);
    } finally {
      setDownloadLoading(false);
    }
  }, [instance, selectedPage, pdfData, imageData, fileType, setErrorMessage]);

  return [downloadLoading, handleDownload] as const;
};
