import { useState, useCallback } from 'react';
import { useAppContext } from '../Context/AppContext';
import { ImgToPdf, DataURLToBlob } from '../Components/ConverterTool';
import { format } from 'date-fns';
import { uploadFile } from '../api';

type UseSaveFileReturnType = [boolean, () => Promise<void>];

export const useSaveFile = (): UseSaveFileReturnType => {
  const {
    instance,
    selectedPage,
    pdfData,
    imageData,
    newFilename,
    fileType,
    params,
    setNotificationMessage,
    setIsModalOpen,
    setNewFilename,
  } = useAppContext();

  const [saveFileLoading, setSaveFileLoading] = useState<boolean>(false);

  const handleSaveFile = useCallback(async () => {
    setSaveFileLoading(true);

    try {
      const apiUrl = params.api;
      if (!apiUrl) throw new Error('URL is incomplete');
      if (!instance) throw new Error('Editor instance not initialized');
      console.log(params.file);

      // 套件在放大時會自動裁切，所以要抓完整頁面
      instance.resetZoom();
      const dataURL = instance.toDataURL();
      const url = params.file ?? '';
      const oldFilename = url.split('/').pop() || `untitled.${fileType}`;
      const filename = newFilename ? `${newFilename}.${fileType}` : oldFilename;

      if (fileType === 'pdf' && pdfData) {
        // 更新當前頁面的修改
        if (imageData[selectedPage - 1] !== dataURL) {
          imageData[selectedPage - 1] = dataURL;
        }

        const pdfBlob = await ImgToPdf(imageData, pdfData);
        await saveBlobToFile(pdfBlob, filename, apiUrl);
        return;
      }

      if (fileType === 'jpg' || fileType === 'png') {
        const imgBlob = DataURLToBlob(dataURL);
        await saveBlobToFile(imgBlob, filename, apiUrl);
        return;
      }

      throw new Error('Unsupported file type for save');
    } catch (error) {
      console.error('Error saving file:', error);
      setNotificationMessage('Error saving file');
    } finally {
      setSaveFileLoading(false);
      setIsModalOpen('');
    }
  }, [instance, newFilename, fileType, imageData, selectedPage, pdfData]);

  const saveBlobToFile = async (
    blob: Blob,
    filename: string,
    apiUrl: string
  ) => {
    const formData = new FormData();
    formData.append('file', blob, filename);
    await uploadFile(apiUrl, formData);
    setNotificationMessage('File saved successfully!');
    setNewFilename('');
  };

  return [saveFileLoading, handleSaveFile];
};
