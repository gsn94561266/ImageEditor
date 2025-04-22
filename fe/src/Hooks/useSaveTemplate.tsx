import { useState, useCallback } from "react";
import { useAppContext } from "../Context/AppContext";
import { format } from "date-fns";
import { createTemplate } from "../api";

type UseSaveFileReturnType = [boolean, () => Promise<void>];

export const useSaveTemplate = (
  loadTemplate: () => Promise<void>
): UseSaveFileReturnType => {
  const {
    instance,
    templateName,
    params,
    setNotificationMessage,
    setIsModalOpen,
    setTemplateName,
  } = useAppContext();

  const [saveTemplateLoading, setSaveTemplateLoading] =
    useState<boolean>(false);

  const handleSaveTemplate = useCallback(async () => {
    setSaveTemplateLoading(true);

    try {
      if (!instance) throw new Error("Editor instance not initialized");

      const content = JSON.stringify(instance._graphics._objects);
      if (content === "{}") {
        throw new Error("Template does not exist.");
      }

      const now = new Date();
      const platformsID = params.platform;
      const userID = params.user;
      const id = `${platformsID}-${format(now, "yyMMddHHmmss")}`;
      const createdOn = now.toISOString();

      const templateData = {
        platformsID,
        userID,
        id,
        name: templateName,
        content,
        createdBy: userID,
        createdOn,
      };

      await createTemplate(templateData);
      await loadTemplate();
      setNotificationMessage("Template saved successfully!");
      setTemplateName("");
    } catch (error) {
      console.error("Error saving template:", error);
      setNotificationMessage("Error saving template");
    } finally {
      setSaveTemplateLoading(false);
      setIsModalOpen("");
    }
  }, [instance, templateName, loadTemplate]);

  return [saveTemplateLoading, handleSaveTemplate];
};
