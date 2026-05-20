import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { FiX } from "react-icons/fi";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  height?: number | string;
  showCloseButton?: boolean;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  height = 400,
  showCloseButton = true,
  children,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  const heightStyle = typeof height === "number" ? `${height}px` : height;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 transition-all"
      onClick={handleBackdropClick}
    >
      <div
        ref={sheetRef}
        className="bg-white rounded-t-2xl w-full max-w-full overflow-auto shadow-xl animate-slide-up"
        style={{ height: heightStyle, maxHeight: "90vh" }}
      >
        {showCloseButton && (
          <div className="sticky top-0 right-0 flex justify-end p-2 bg-white border-b">
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
};
