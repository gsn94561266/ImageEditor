import { useState } from "react";

interface FormModalProps {
  title: string;
  label?: string;
  name?: string;
  setName?: (value: string) => void;
  loading: boolean;
  isOpen: boolean;
  onSave: () => void;
  onClose: () => void;
}

const SaveFormModal: React.FC<FormModalProps> = ({
  title,
  label,
  name,
  setName,
  loading,
  isOpen,
  onSave,
  onClose,
}) => {
  const [isInvalid, setIsInvalid] = useState<boolean>(false);

  const validateFilename = () => {
    const invalidChars = /[\\/:*?"<>|]/;
    return name && name.trim() !== "" && !invalidChars.test(name);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal fade show d-block bg-black bg-opacity-50">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header py-2">
            <h1 className="modal-title fs-5">{title}</h1>
            <button
              type="button"
              className="btn-close fs-7"
              onClick={() => {
                setName && setName("");
                setIsInvalid(false);
                onClose();
              }}
            />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!validateFilename() && title !== "Save") {
                setIsInvalid(true);
                return;
              }
              !loading && onSave();
            }}
          >
            <div className="modal-body">
              <label className="form-label">{label}</label>
              <div className="input-group mb-1">
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => {
                    setIsInvalid(false);
                    setName && setName(e.target.value);
                  }}
                />
              </div>
              {isInvalid && (
                <div className="fs-7 text-danger">
                  The name contains invalid characters or is empty.
                </div>
              )}
            </div>
            <div className="modal-footer border-top-0">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setName && setName("");
                  setIsInvalid(false);
                  onClose();
                }}
              >
                Close
              </button>
              <button type="submit" className="btn btn-primary">
                {loading && (
                  <span
                    className="spinner-border spinner-border-sm me-1"
                    role="status"
                  />
                )}
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SaveFormModal;
