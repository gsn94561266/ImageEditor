import { useState, useEffect } from "react";
import { useAppContext } from "../Context/AppContext";
import { PdfToImg } from "../Components/ConverterTool";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { fetchFile } from "../api";

GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.mjs";

export const useFetchFile = () => {
  const {
    setFileType,
    setPdfData,
    setImageData,
    setNotificationMessage,
    localFile,
    params,
  } = useAppContext();

  const [fetchLoading, setFetchLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      // 處裡 PDF 文件
      const handlePdf = async (data: ArrayBuffer) => {
        try {
          setFileType("pdf");
          const pdfBlob = new Blob([data], { type: "application/pdf" });
          setPdfData(pdfBlob);

          const pdf = await getDocument({ data }).promise;
          const numPages = pdf.numPages;

          const imagePromises: Promise<string | undefined>[] = [];
          for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
            const page = await pdf.getPage(pageNumber);
            imagePromises.push(PdfToImg(page));
          }

          const images = (await Promise.all(imagePromises)).filter(
            (image): image is string => image !== undefined
          );
          setImageData(images);
        } catch (error) {
          setNotificationMessage("Error processing PDF file.");
          console.error("Error processing PDF:", error);
        }
      };

      // 處裡圖片文件
      const handleImage = async (data: ArrayBuffer, fileType: string) => {
        try {
          setFileType(fileType);
          const imgBlob = new Blob([data]);
          const imgDataUrl = await readFileAsDataURL(imgBlob);
          setImageData([imgDataUrl]);
        } catch (error) {
          setNotificationMessage("Error processing image file.");
          console.error("Error processing image:", error);
        }
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

      // 將 Blob 文件讀取為 ArrayBuffer
      const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = reject;
          reader.readAsArrayBuffer(file);
        });
      };

      const processFile = async (
        contentType: string,
        fileArrayBuffer: ArrayBuffer
      ) => {
        switch (true) {
          case contentType.includes("application/pdf"):
            await handlePdf(fileArrayBuffer);
            break;
          case contentType.includes("image/jpeg"):
            await handleImage(fileArrayBuffer, "jpg");
            break;
          case contentType.includes("image/png"):
            await handleImage(fileArrayBuffer, "png");
            break;
          default:
            throw new Error("Unsupported file type.");
        }
      };

      try {
        setFetchLoading(true);

        const fileUrl = params.file;
        const apiUrl = params.api;

        if (fileUrl && apiUrl) {
          const decodedFileUrl = decodeURIComponent(fileUrl);
          const { data, headers } = await fetchFile(decodedFileUrl);
          const fileArrayBuffer = data;
          const contentType = headers["content-type"];
          await processFile(contentType, fileArrayBuffer);
          return;
        }
        if (localFile) {
          const fileArrayBuffer = await readFileAsArrayBuffer(localFile);
          const contentType = localFile.type;
          await processFile(contentType, fileArrayBuffer);
          return;
        }
      } catch (error) {
        console.error("Error fetching file:", error);
        setNotificationMessage("Error fetching file");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchData();
  }, [localFile, params]);

  return fetchLoading;
};
