import { createContext, useContext, useState, useEffect } from "react";

interface AppContextProps {
  imageData: string[];
  setImageData: (value: string[]) => void;
  templateData: any[];
  setTemplateData: (value: any[]) => void;
  instance: any;
  setInstance: (value: any) => void;
  newFilename: string;
  setNewFilename: (value: string) => void;
  templateName: string;
  setTemplateName: (value: string) => void;
  fileType: string;
  setFileType: (value: string) => void;
  pdfData: Blob | null;
  setPdfData: (value: Blob | null) => void;
  selectedPage: number;
  setSelectedPage: (value: number) => void;
  inputPage: string;
  setInputPage: (value: string) => void;
  pageSelection: boolean;
  setPageSelection: (value: boolean) => void;
  isPageChanging: boolean;
  setIsPageChanging: (value: boolean) => void;
  isModalOpen: string;
  setIsModalOpen: (value: string) => void;
  notificationMessage: string;
  setNotificationMessage: (value: string) => void;
  localFile: File | null;
  setLocalFile: (value: File) => void;
  params: {
    file: string | null;
    api: string | null;
    platform: string | null;
    user: string | null;
  };
  setParams: (value: {
    file: string | null;
    api: string | null;
    platform: string | null;
    user: string | null;
  }) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [imageData, setImageData] = useState<string[]>([]);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [pdfData, setPdfData] = useState<Blob | null>(null);
  const [templateData, setTemplateData] = useState<any[]>([]);
  const [instance, setInstance] = useState<any>(null);
  const [newFilename, setNewFilename] = useState<string>("");
  const [templateName, setTemplateName] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [inputPage, setInputPage] = useState<string>(selectedPage.toString());
  const [pageSelection, setPageSelection] = useState<boolean>(false);
  const [isPageChanging, setIsPageChanging] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<string>("");
  const [notificationMessage, setNotificationMessage] = useState<string>("");
  const [params, setParams] = useState({
    file: null as string | null,
    api: null as string | null,
    platform: null as string | null,
    user: null as string | null,
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setParams({
      file: urlParams.get("file"),
      api: urlParams.get("api"),
      platform: urlParams.get("platform"),
      user: urlParams.get("user"),
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        imageData,
        setImageData,
        templateData,
        setTemplateData,
        instance,
        setInstance,
        newFilename,
        setNewFilename,
        templateName,
        setTemplateName,
        fileType,
        setFileType,
        pdfData,
        setPdfData,
        selectedPage,
        setSelectedPage,
        inputPage,
        setInputPage,
        pageSelection,
        setPageSelection,
        isPageChanging,
        setIsPageChanging,
        isModalOpen,
        setIsModalOpen,
        notificationMessage,
        setNotificationMessage,
        localFile,
        setLocalFile,
        params,
        setParams,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
