import { useState, useCallback } from "react";
import { useAppContext } from "../Context/AppContext";
import { ImgToPdf, DataURLToBlob } from "../Components/ConverterTool";
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

export const useDownloadFile = () => {
  const {
    instance,
    selectedPage,
    pdfData,
    imageData,
    fileType,
    setNotificationMessage,
  } = useAppContext();

  const [downloadLoading, setDownloadLoading] = useState(false);

  const handleDownload = useCallback(async () => {
    setDownloadLoading(true);

    try {
      if (!instance) throw new Error("Editor instance not initialized");

      instance.resetZoom();
      const dataURL = instance.toDataURL();
      const filename = `${format(new Date(), "yyyyMMdd_HHmmss")}.${fileType}`;

      if (fileType === "pdf" && pdfData) {
        // 更新當前頁面的修改
        if (imageData[selectedPage - 1] !== dataURL) {
          imageData[selectedPage - 1] = dataURL;
        }

        const pdfBlob = await ImgToPdf(imageData, pdfData);
        const downloadUrl = URL.createObjectURL(pdfBlob);
        createAndClickLink(downloadUrl, filename);
        return;
      }
      if (fileType === "jpg" || fileType === "png") {
        const blob = DataURLToBlob(dataURL);
        const downloadUrl = URL.createObjectURL(blob);
        createAndClickLink(downloadUrl, filename);
        return;
      }
      throw new Error("Unsupported file type for download.");
    } catch (error) {
      console.error("Error downloading file:", error);
      setNotificationMessage((error as Error).message);
    } finally {
      setDownloadLoading(false);
    }
  }, [
    instance,
    selectedPage,
    pdfData,
    imageData,
    fileType,
    setNotificationMessage,
  ]);

  return [downloadLoading, handleDownload] as const;
};
