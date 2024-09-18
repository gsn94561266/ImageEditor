import { useEffect } from "react";

interface ErrorToastProps {
  message: string;
  onClose: () => void;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="modal fade show d-block" onClick={onClose}>
      <div className="modal-dialog">
        <div className="modal-content">
          <p className="text-center pt-4 pb-2 px-4 text-break">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorToast;
