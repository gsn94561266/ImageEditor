import { useState, useCallback, ChangeEvent } from 'react';
import {
  useFetchFile,
  useImageEditor,
  useDownloadFile,
  useSaveFile,
} from './Hooks';
import { BiGridAlt } from 'react-icons/bi';
import { MdArrowBackIosNew, MdArrowForwardIos } from 'react-icons/md';
import ErrorToast from './Components/ErrorToast';
import './App.css';

const App = () => {
  const [imageData, setImageData] = useState<string[]>([]);
  const [instance, setInstance] = useState<any>(null);
  const [newFilename, setNewFilename] = useState<string>('');
  const [filename, setFilename] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [pdfData, setPdfData] = useState<any>(null);
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [inputPage, setInputPage] = useState<string>(selectedPage.toString());
  const [pageSelection, setPageSelection] = useState<boolean>(false);
  const [isInvalid, setIsInvalid] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fetchLoading = useFetchFile(
    file,
    setFileUrl,
    setFileType,
    setPdfData,
    setImageData,
    setFilename,
    setErrorMessage
  );

  const editorRef = useImageEditor(
    imageData,
    fileType,
    selectedPage,
    setInstance
  );

  const [downloadLoading, handleDownload] = useDownloadFile(
    instance,
    selectedPage,
    pdfData,
    imageData,
    fileType,
    setErrorMessage
  );

  const [saveLoading, handleSave] = useSaveFile(
    instance,
    selectedPage,
    pdfData,
    imageData,
    filename,
    newFilename,
    fileType,
    isModalOpen,
    setIsModalOpen,
    setErrorMessage
  );

  // PDF換頁
  const handlePageChange = useCallback(
    (page?: number) => {
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
    },
    [instance, inputPage, selectedPage, imageData]
  );

  // 上傳內嵌圖片
  const handleIconUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && instance) {
      const url = URL.createObjectURL(file);
      instance.addImageObject(url).then(() => {
        URL.revokeObjectURL(url);
      });
    }
  };

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // 檔名驗證
  const validateFilename = () => {
    const invalidChars = /[\\/:*?"<>|]/;
    return (
      newFilename &&
      newFilename.trim() !== '' &&
      !invalidChars.test(newFilename)
    );
  };

  return (
    <div className="bg-dark vh-100">
      {!fetchLoading && (
        <nav className="row fixed-top bg-black p-2">
          <div className="col-12 col-md-5 text-light d-flex align-items-center">
            {imageData.length > 1 && (
              <>
                <div className="dropdown">
                  <button
                    className={
                      pageSelection
                        ? 'btn btn-primary btn-sm p-0'
                        : 'btn btn-black btn-sm text-white p-0'
                    }
                    type="button"
                    onClick={() => setPageSelection(!pageSelection)}>
                    <BiGridAlt className="fs-4 p-0" />
                  </button>
                </div>
                <div className="ms-2 d-flex align-items-center fs-7">
                  <span>Page</span>
                  <div className="d-flex mx-1 align-items-center">
                    <button
                      className="btn btn-dark text-white p-0 d-flex align-items-center"
                      onClick={() => handlePageChange(selectedPage - 1)}>
                      <MdArrowBackIosNew className="fs-5 p-1" />
                    </button>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handlePageChange();
                      }}>
                      <input
                        value={inputPage}
                        className="mx-1 bg-dark text-white border-0 text-center"
                        style={{
                          width: '2.5rem',
                          height: '1.4rem',
                        }}
                        onChange={(e) => {
                          const value = e.target.value;
                          setInputPage(value);
                        }}
                        onBlur={() => handlePageChange()}
                      />
                    </form>
                    <button
                      className="btn btn-dark text-white p-0 d-flex align-items-center"
                      onClick={() => handlePageChange(selectedPage + 1)}>
                      <MdArrowForwardIos className="fs-5 p-1" />
                    </button>
                  </div>
                  <span>of</span>
                  <span className="ms-2">{imageData.length}</span>
                </div>
              </>
            )}
          </div>
          <div className="col-12 col-md-7 text-md-end text-start">
            <div className="mt-1">
              <label className="btn btn-light btn-sm mx-2">
                Upload
                <input
                  className="d-none"
                  type="file"
                  accept="image/*"
                  onChange={handleIconUpload}
                />
              </label>

              <button
                type="button"
                className="btn btn-info btn-sm mx-2"
                onClick={handleDownload}>
                {downloadLoading && (
                  <span
                    className="spinner-border spinner-border-sm me-1"
                    role="status"
                    aria-hidden="true"
                  />
                )}
                Download
              </button>

              {!fileUrl ? (
                <label className="btn btn-primary btn-sm mx-2">
                  Import
                  <input
                    className="d-none"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleImport}
                  />
                </label>
              ) : (
                <div className="dropdown-end d-inline mx-2">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-expanded="false">
                    {saveLoading && (
                      <span
                        className="spinner-border spinner-border-sm me-1"
                        role="status"
                        aria-hidden="true"
                      />
                    )}
                    Save
                  </button>
                  <ul className="dropdown-menu dropdown-menu-dark">
                    <li>
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={() => setIsModalOpen('save')}>
                        Save
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={() => setIsModalOpen('saveAs')}>
                        Save As...
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}

      <main className="row ms-0">
        {fetchLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
        {pageSelection && (
          <div className="col-4 col-lg-3 col-xxl-2 pe-0 bg-black">
            <div className="page-selector pt-5 px-0 px-md-5 text-center">
              {imageData?.map((data, index) => (
                <div key={index} className="my-5 px-3">
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
                  <div className="fs-7 text-light my-3">
                    <span
                      className={`${
                        selectedPage === index + 1
                          ? 'bg-primary'
                          : 'bg-secondary'
                      } px-4 py-1 rounded-1`}>
                      {index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="col ps-0">
          <div ref={editorRef} />
        </div>
      </main>

      {isModalOpen === 'save' && (
        <div className="modal fade show d-block bg-black bg-opacity-50">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header py-2">
                <h1 className="modal-title fs-5">Save</h1>
                <button
                  type="button"
                  className="btn-close fs-7"
                  onClick={() => setIsModalOpen('')}
                />
              </div>
              <div className="modal-body">
                <p className="m-0">
                  Do you want to overwrite the existing file?
                </p>
              </div>
              <div className="modal-footer border-top-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen('')}>
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}>
                  {saveLoading && (
                    <span
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                    />
                  )}
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen === 'saveAs' && (
        <div className="modal fade show d-block bg-black bg-opacity-50">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!validateFilename()) {
                    setIsInvalid(true);
                    return;
                  }
                  handleSave();
                }}>
                <div className="modal-header py-2">
                  <h1 className="modal-title fs-5">Save As</h1>
                  <button
                    type="button"
                    className="btn-close fs-7"
                    onClick={() => setIsModalOpen('')}
                  />
                </div>
                <div className="modal-body">
                  <label className="form-label">FileName</label>
                  <div className="input-group mb-1">
                    <input
                      type="text"
                      className="form-control"
                      value={newFilename}
                      onChange={(e) => {
                        setIsInvalid(false);
                        setNewFilename(e.target.value);
                      }}
                    />
                    <span className="input-group-text">{fileType}</span>
                  </div>
                  {isInvalid && (
                    <div className="fs-7 text-danger">
                      The filename contains invalid characters or is empty.
                    </div>
                  )}
                </div>
                <div className="modal-footer border-top-0">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsModalOpen('')}>
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {saveLoading && (
                      <span
                        className="spinner-border spinner-border-sm me-1"
                        role="status"
                        aria-hidden="true"
                      />
                    )}
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ErrorToast message={errorMessage} onClose={() => setErrorMessage('')} />
    </div>
  );
};

export default App;
