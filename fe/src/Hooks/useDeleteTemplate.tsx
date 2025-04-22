import { useState, useCallback } from "react";
import { useAppContext } from "../Context/AppContext";
import { deleteTemplate } from "../api";

type UseSaveFileReturnType = [
  boolean,
  string,
  (value: string) => void,
  () => Promise<void>
];

export const useDeleteTemplate = (
  loadTemplate: () => Promise<void>
): UseSaveFileReturnType => {
  const { setNotificationMessage } = useAppContext();
  const [deleteTemplateUid, setDeleteTemplateUid] = useState<string>("");
  const [deleteTemplateLoading, setDeleteTemplateLoading] =
    useState<boolean>(false);

  const handleDeleteTemplate = useCallback(async () => {
    if (!deleteTemplateUid) return;
    setDeleteTemplateLoading(true);
    try {
      await deleteTemplate(deleteTemplateUid);
      setNotificationMessage("Template deleted successfully!");
      await loadTemplate();
    } catch (error) {
      setNotificationMessage("Error deleting template");
      console.error("Error deleting template:", error);
    } finally {
      setDeleteTemplateLoading(false);
      setDeleteTemplateUid("");
    }
  }, [loadTemplate]);

  return [
    deleteTemplateLoading,
    deleteTemplateUid,
    setDeleteTemplateUid,
    handleDeleteTemplate,
  ];
};
