import { useEffect } from "react";

interface ErrorToastProps {
  message: string;
  onClose: () => void;
}

const MessageToast: React.FC<ErrorToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="modal fade show d-block" onClick={onClose}>
      <div
        className="position-fixed end-0 bottom-0 me-5 mb-4"
        style={{ maxWidth: "20rem" }}
      >
        <div
          className={`modal-content ${
            message?.includes("Error")
              ? "bg-danger-subtle"
              : "bg-warning-subtle"
          }`}
        >
          <p className="text-center pt-4 pb-2 px-4 text-break">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default MessageToast;
