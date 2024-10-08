import { useState, useCallback } from 'react';
import { ImgToPdf } from '../Components/PdfConversion';
import { DataURLToBlob } from '../Components/DataURLToBlob';
import { format } from 'date-fns';

export const useSaveFile = (
  instance: any,
  selectedPage: number,
  pdfData: Blob,
  imageData: string[],
  filename: string,
  newFilename: string,
  fileType: string,
  isModalOpen: string,
  setIsModalOpen: (message: string) => void,
  setErrorMessage: (message: string) => void
): [boolean, () => Promise<void>] => {
  const [saveLoading, setSaveLoading] = useState<boolean>(false);

  const handleSave = useCallback(async () => {
    setSaveLoading(true);

    try {
      // 從網址獲取 API 端點
      const urlParams = new URLSearchParams(window.location.search);
      const apiEndpoint = urlParams.get('apiEndpoint');
      if (!apiEndpoint) {
        throw new Error('URL is incomplete. Please check and try again.');
      }

      if (!instance) throw new Error('Editor instance not initialized');

      // 套件在放大時會自動裁切，所以這裡要抓完整頁面
      instance.resetZoom();

      const dataURL = instance.toDataURL();
      const formData = new FormData();
      const name =
        isModalOpen === 'save'
          ? filename
          : isModalOpen === 'saveAs'
          ? `${newFilename}.${fileType}`
          : '';

      if (fileType === 'pdf') {
        // 更新當前頁面的修改
        if (imageData[selectedPage - 1] !== dataURL) {
          imageData[selectedPage - 1] = dataURL;
        }
        const pdfBlob = await ImgToPdf(imageData, pdfData);
        formData.append('file', pdfBlob, name);
      } else if (fileType === 'jpg' || fileType === 'png') {
        const imgBlob = DataURLToBlob(dataURL);
        formData.append('file', imgBlob, name);
      } else {
        throw new Error('Unsupported file type for save');
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to save file: ${response.statusText}`);
      }
      setIsModalOpen('');
    } catch (error) {
      console.error('Error saving file:', error);
      setErrorMessage((error as Error).message);
    } finally {
      setSaveLoading(false);
    }
  }, [
    instance,
    selectedPage,
    pdfData,
    imageData,
    filename,
    newFilename,
    fileType,
    isModalOpen,
    setIsModalOpen,
    setErrorMessage,
  ]);

  return [saveLoading, handleSave];
};
