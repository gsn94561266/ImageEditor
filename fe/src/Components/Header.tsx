import { useState, useEffect, ChangeEvent } from 'react';
import { MdArrowBackIosNew, MdArrowForwardIos } from 'react-icons/md';
import {
  useFetchTemplate,
  useSetTemplate,
  useSaveTemplate,
  useDeleteTemplate,
} from '../Hooks';
import SaveFormModal from './SaveFormModal';
import DeleteModal from '../Components/DeleteModal';
import { useAppContext } from '../Context/AppContext';
import { BiGridAlt } from 'react-icons/bi';
import {
  MdDelete,
  MdOutlineWidthNormal,
  MdOutlineWidthWide,
} from 'react-icons/md';

interface HeaderProps {
  handlePageChange: (page?: number) => void;
  downloadLoading: boolean;
  handleDownload: () => void;
  saveLoading: boolean;
}

const Header: React.FC<HeaderProps> = ({
  handlePageChange,
  downloadLoading,
  handleDownload,
  saveLoading,
}) => {
  const {
    instance,
    imageData,
    pageSelection,
    setPageSelection,
    selectedPage,
    inputPage,
    setInputPage,
    isModalOpen,
    setIsModalOpen,
    setLocalFile,
    localFile,
    templateData,
    templateName,
    setTemplateName,
  } = useAppContext();
  const [fitPage, setFitPage] = useState<boolean>(false);
  const [loadTemplate, fetchTemplateLoading] = useFetchTemplate();
  const [saveTemplateLoading, handleSaveTemplate] =
    useSaveTemplate(loadTemplate);
  const [selectedTemplateUid, handleTemplateSetting] = useSetTemplate();
  const [
    deleteTemplateLoading,
    deleteTemplateUid,
    setDeleteTemplateUid,
    handleDeleteTemplate,
  ] = useDeleteTemplate(loadTemplate);

  // 上傳內嵌圖片
  const handleIconUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && instance) {
      const url = URL.createObjectURL(file);
      instance.addImageObject(url);
    }
  };

  const handlefileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLocalFile(file);
    }
  };

  useEffect(() => {
    const resizeCanvas = () => {
      const width = window.innerWidth - 100;
      const height = fitPage
        ? window.innerHeight - 100
        : window.innerHeight * 2;

      instance?.resizeCanvasDimension({
        width,
        height,
      });
    };

    resizeCanvas();
  }, [fitPage]);

  return (
    <nav className="row fixed-top bg-black py-2 m-0">
      <div className="col-12 col-md-5 text-light d-flex">
        <button
          className={
            pageSelection
              ? 'btn btn-primary btn-sm'
              : 'btn btn-black btn-sm text-white'
          }
          type="button"
          title="Thumbnails"
          onClick={() => setPageSelection(!pageSelection)}>
          <BiGridAlt className="fs-4" />
        </button>

        <button
          className="btn btn-black btn-sm text-white"
          type="button"
          title={fitPage ? 'Fit Width' : 'Fit Page'}
          onClick={() => setFitPage(!fitPage)}>
          {fitPage ? (
            <MdOutlineWidthWide className="fs-4" />
          ) : (
            <MdOutlineWidthNormal className="fs-4" />
          )}
        </button>

        {imageData.length > 0 && (
          <div className="ms-3 d-flex align-items-center fs-7 fw-semibold">
            <span>Page</span>
            <div className="d-flex mx-2 align-items-center">
              <button
                className="btn btn-sm btn-dark text-white d-flex align-items-center px-1"
                onClick={() => handlePageChange(selectedPage - 1)}>
                <MdArrowBackIosNew className="fs-7 fw-bold" />
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
                    height: '1.45rem',
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    setInputPage(value);
                  }}
                  onBlur={() => handlePageChange()}
                />
              </form>
              <button
                className="btn btn-sm btn-dark text-white d-flex align-items-center px-1"
                onClick={() => handlePageChange(selectedPage + 1)}>
                <MdArrowForwardIos className="fs-7 fw-bold" />
              </button>
            </div>
            <span>of</span>
            <span className="ms-2">{imageData.length}</span>
          </div>
        )}
      </div>

      <div className="col-12 col-md-7">
        <div className="row justify-content-md-end m-0 gx-2 gy-1">
          {/* Template */}
          {imageData.length > 0 && !localFile && (
            <div className="col-auto">
              <div className="dropdown p-0">
                <button
                  className="btn btn-light btn-sm dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  disabled={templateData.length === 0}>
                  {fetchTemplateLoading && (
                    <span
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                      aria-hidden="true"
                    />
                  )}
                  Template
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-end dropdown-menu-dark fs-7 p-0"
                  style={{ maxHeight: '80vh', overflow: 'auto' }}>
                  {templateData.map((v, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        className={`dropdown-item d-flex justify-content-between align-items-center py-2 ${
                          v.id === selectedTemplateUid
                            ? 'active text-black'
                            : ''
                        }`}
                        onClick={() => {
                          handleTemplateSetting(v);
                        }}>
                        {v.name}
                        <MdDelete
                          type="button"
                          className={`fs-5 ${
                            v.id === deleteTemplateUid && 'text-danger'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTemplateUid(v.id);
                            setIsModalOpen('deleteTemplate');
                          }}
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Insert Image */}
          {imageData.length > 0 && (
            <div className="col-auto">
              <label className="btn btn-light btn-sm">
                Insert Image
                <input
                  className="d-none"
                  type="file"
                  accept=".jpg, .jpeg, .png"
                  onChange={handleIconUpload}
                />
              </label>
            </div>
          )}

          {/* Download */}
          {imageData.length > 0 && (
            <div className="col-auto">
              <button
                type="button"
                className="btn btn-sm btn-light"
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
            </div>
          )}

          {/* save */}
          {imageData.length > 0 && !localFile ? (
            <div className="col-auto">
              <div className="dropdown p-0">
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
                <ul className="dropdown-menu dropdown-menu-dark fs-7 p-0">
                  <li>
                    <button
                      type="button"
                      className="dropdown-item py-2"
                      onClick={() => setIsModalOpen('save')}>
                      Save File
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="dropdown-item py-2"
                      onClick={() => setIsModalOpen('saveAs')}>
                      Save File As...
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="dropdown-item py-2"
                      onClick={() => setIsModalOpen('saveTemplateAs')}>
                      Save Template
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="col-auto">
              <label className="btn btn-sm btn-light ">
                Upload
                <input
                  className="d-none"
                  type="file"
                  accept=".jpg, .jpeg, .png, .pdf"
                  onChange={handlefileUpload}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      <SaveFormModal
        title="Save Template"
        label="Template Name"
        name={templateName}
        setName={setTemplateName}
        loading={saveTemplateLoading}
        isOpen={isModalOpen === 'saveTemplateAs'}
        onSave={handleSaveTemplate}
        onClose={() => setIsModalOpen('')}
      />

      <DeleteModal
        title="Delete Template"
        label="Do you want to delete the template?"
        loading={deleteTemplateLoading}
        isOpen={isModalOpen === 'deleteTemplate'}
        onSave={handleDeleteTemplate}
        onClose={() => {
          setIsModalOpen('');
          setDeleteTemplateUid('');
        }}
      />
    </nav>
  );
};

export default Header;
