import { useCallback } from 'react';
import {
  useImageEditor,
  useFetchFile,
  useSaveFile,
  useDownloadFile,
} from './Hooks';
import Header from './Components/Header';
import SaveModal from './Components/SaveModal';
import SaveFormModal from './Components/SaveFormModal';
import MessageToast from './Components/MessageToast';
import { useAppContext } from './Context/AppContext';
import ColorPicker from './Components/ColorPicker';

const MainApp = () => {
  const {
    imageData,
    instance,
    newFilename,
    setNewFilename,
    selectedPage,
    setSelectedPage,
    inputPage,
    setInputPage,
    pageSelection,
    isPageChanging,
    setIsPageChanging,
    isModalOpen,
    setIsModalOpen,
    notificationMessage,
    setNotificationMessage,
  } = useAppContext();

  const fetchFileLoading = useFetchFile();
  const editorRef = useImageEditor();
  const [downloadLoading, handleDownload] = useDownloadFile();
  const [saveFileLoading, handleSaveFile] = useSaveFile();

  // PDF換頁
  const handlePageChange = useCallback(
    async (page?: number) => {
      if (isPageChanging) return;
      setIsPageChanging(true);
      if (instance) {
        // 套件在放大的狀態時會裁切到，所以要抓完整頁面
        instance.resetZoom();
        const dataURL = instance.toDataURL();
        const inputPageNum = Number(inputPage);

        const updatePageData = (pageNum: number) => {
          if (pageNum !== selectedPage) {
            // 更新被修改的頁面
            if (imageData[selectedPage - 1] !== dataURL) {
              imageData[selectedPage - 1] = dataURL;
            }
            setSelectedPage(pageNum);
            setInputPage(pageNum.toString());
          }
        };

        const isValidPage = (num: number) => num > 0 && num <= imageData.length;

        if (page !== undefined && isValidPage(page)) {
          updatePageData(page);
        } else if (isValidPage(inputPageNum)) {
          updatePageData(inputPageNum);
        } else {
          setInputPage(selectedPage.toString());
        }
      }

      setTimeout(() => {
        setIsPageChanging(false);
      }, 300);
    },
    [
      isPageChanging,
      setIsPageChanging,
      instance,
      inputPage,
      selectedPage,
      imageData,
      setSelectedPage,
      setInputPage,
    ]
  );

  return (
    <div className="bg-dark vh-100">
      <Header
        handlePageChange={handlePageChange}
        downloadLoading={downloadLoading}
        handleDownload={handleDownload}
        saveLoading={saveFileLoading}
      />

      <main className="row ms-0">
        {fetchFileLoading && (
          <div className="loading-overlay">
            <div className="spinner" />
          </div>
        )}

        {pageSelection && (
          <div className="col-xl-1 col-md-2 col-3 p-0 bg-black">
            <div className="page-selector pt-5 mt-2 px-0 text-center">
              {imageData.map((data, index) => (
                <div key={index} className="my-4 px-3">
                  <button
                    type="button"
                    className="border-0 rounded-1 p-0"
                    onClick={() => handlePageChange(index + 1)}>
                    <div
                      className={
                        selectedPage === index + 1
                          ? 'border border-primary border-4 rounded-1'
                          : undefined
                      }>
                      <img
                        key={index}
                        src={data}
                        className="page-img"
                        alt={`Page ${index + 1}`}
                      />
                    </div>
                  </button>
                  <div className="fs-7 text-light my-2">{index + 1}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="col ps-0">
          <div ref={editorRef} />
          {imageData.length > 0 && <ColorPicker />}
        </div>
      </main>

      <SaveModal
        title="Save File"
        label="Do you want to overwrite the existing file?"
        loading={saveFileLoading}
        isOpen={isModalOpen === 'save'}
        onSave={handleSaveFile}
        onClose={() => setIsModalOpen('')}
      />

      <SaveFormModal
        title="Save File As"
        label="Filename"
        name={newFilename}
        setName={setNewFilename}
        loading={saveFileLoading}
        isOpen={isModalOpen === 'saveAs'}
        onSave={handleSaveFile}
        onClose={() => setIsModalOpen('')}
      />

      <MessageToast
        message={notificationMessage}
        onClose={() => setNotificationMessage('')}
      />
    </div>
  );
};

export default MainApp;
