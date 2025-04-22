import { useState } from "react";

interface FormModalProps {
  title: string;
  label?: string;
  loading: boolean;
  isOpen: boolean;
  onSave: () => void;
  onClose: () => void;
}

const SaveModal: React.FC<FormModalProps> = ({
  title,
  label,
  loading,
  isOpen,
  onSave,
  onClose,
}) => {
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
                onClose();
              }}
            />
          </div>
          <div className="modal-body">
            <label className="form-label">{label}</label>
          </div>
          <div className="modal-footer border-top-0">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                onClose();
              }}
            >
              Close
            </button>
            <button type="button" className="btn btn-primary" onClick={onSave}>
              {loading && (
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
  );
};

export default SaveModal;
