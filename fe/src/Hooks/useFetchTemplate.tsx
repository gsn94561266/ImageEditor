import { useState, useEffect } from "react";
import { useAppContext } from "../Context/AppContext";
import { fetchTemplate } from "../api";

type UseFetchTemplateReturnType = [() => Promise<void>, boolean];

export const useFetchTemplate = (): UseFetchTemplateReturnType => {
  const { imageData, localFile, setNotificationMessage, setTemplateData } =
    useAppContext();
  const [fetchLoading, setFetchLoading] = useState<boolean>(false);

  const loadTemplate = async () => {
    if (imageData.length === 0 || localFile) return;

    setFetchLoading(true);
    try {
      const data = await fetchTemplate();
      setTemplateData(data);
    } catch (error) {
      setNotificationMessage("Error fetching template");
      console.error("Error fetching template:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    loadTemplate();
  }, [imageData]);

  return [loadTemplate, fetchLoading];
};
