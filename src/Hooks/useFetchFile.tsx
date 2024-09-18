import { useState, useEffect } from "react";
import { PdfToImg } from "../Components/PdfConversion";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.mjs";

// 將 Blob 文件讀取為 ArrayBuffer
const readFileAsArrayBuffer = (blob: Blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
};

// 將 Blob 文件讀取為 DataURL
const readFileAsDataURL = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const useFetchFile = (
  file: File | null,
  setFileUrl: (type: string) => void,
  setFileType: (type: string) => void,
  setPdfData: (data: Blob) => void,
  setImageData: (data: string[]) => void,
  setErrorMessage: (message: string) => void
) => {
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setFetchLoading(true);

      // 處裡 PDF 文件
      const handlePdf = async (pdfBlob: Blob) => {
        try {
          setFileType("pdf");
          const pdfBytes = (await readFileAsArrayBuffer(
            pdfBlob
          )) as ArrayBuffer;
          setPdfData(pdfBlob);

          const pdf = await getDocument({ data: pdfBytes }).promise;
          const numPages = pdf.numPages;

          const imagePromises = Array.from({ length: numPages }, (_, i) =>
            pdf.getPage(i + 1).then(PdfToImg)
          );

          const images = (await Promise.all(imagePromises)).filter(
            (image): image is string => image !== undefined
          );
          setImageData(images);
        } catch (error) {
          setErrorMessage("Error processing PDF file.");
          console.error("Error processing PDF:", error);
        }
      };

      // 處裡圖片文件
      const handleImage = async (imgBlob: Blob, fileType: string) => {
        try {
          setFileType(fileType);
          const imgDataUrl = await readFileAsDataURL(imgBlob);
          setImageData([imgDataUrl]);
        } catch (error) {
          setErrorMessage("Error processing image file.");
          console.error("Error processing image:", error);
        }
      };

      // fileUrl=http%3A%2F%2F192.168.88.70%3A5000%2Fuploads%2Ftest1.pdf&apiEndpoint=http%3A%2F%2F192.168.88.70%3A5000%2Fupdate
      // 從 URL 獲取文件連結
      const urlParams = new URLSearchParams(window.location.search);
      const basefileUrl = urlParams.get("fileUrl") || "";
      const apiEndpoint = urlParams.get("apiEndpoint");
      const isURL = basefileUrl && apiEndpoint;
      if (!isURL && !file) {
        setFetchLoading(false);
        return;
      }
      setFileUrl(basefileUrl);

      try {
        let contentType = "";
        let fileBlob: Blob;

        if (file) {
          fileBlob = file;
          contentType = file.type;
        } else {
          const decodedFileUrl = decodeURIComponent(basefileUrl);
          const response = await fetch(decodedFileUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
          }
          contentType = response.headers.get("Content-Type") || "";
          fileBlob = await response.blob();
        }

        switch (contentType) {
          case "application/pdf":
            await handlePdf(fileBlob);
            break;
          case "image/jpeg":
            await handleImage(fileBlob, "jpg");
            break;
          case "image/png":
            await handleImage(fileBlob, "png");
            break;
          default:
            throw new Error("Unsupported file type.");
        }
      } catch (error) {
        console.error("Error fetching file:", error);
        setErrorMessage((error as Error).message);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchData();
  }, [
    file,
    setFileUrl,
    setFileType,
    setPdfData,
    setImageData,
    setErrorMessage,
  ]);

  return fetchLoading;
};
