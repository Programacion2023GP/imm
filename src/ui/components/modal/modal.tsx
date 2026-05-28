import { ReactNode, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import { theme } from "../../../config/themes";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  showCloseButton?: boolean;
  titleIcon?: ReactNode;
  subtitle?: string;
  headerClassName?: string;
  footerClassName?: string;
  zIndex?: number | string;
  closeOnBackdropClick?: boolean;
}

const CustomModal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  showCloseButton = true,
  titleIcon,
  subtitle,
  headerClassName = "",
  footerClassName = "",
  zIndex = 200,
  closeOnBackdropClick = true,
}: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0"
          style={{
            zIndex,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="absolute bottom-0 left-0 right-0 flex flex-col bg-white rounded-t-2xl shadow-2xl overflow-hidden"
            style={{
              background: theme.colors.background.card,
              maxHeight: "90vh",
              height: "auto",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              mass: 0.8,
            }}
          >
            {/* Header elegante */}
            <div
              className={`sticky top-0 z-10 border-b ${headerClassName}`}
              style={{
                background: theme.colors.background.card,
                borderBottomColor: theme.colors.border.DEFAULT,
              }}
            >
              <div className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {titleIcon && (
                      <div
                        className="mt-1"
                        style={{ color: theme.colors.text.secondary }}
                      >
                        {titleIcon}
                      </div>
                    )}
                    <div>
                      <h1
                        className="text-2xl font-bold"
                        style={{ color: theme.colors.text.primary }}
                      >
                        {title}
                      </h1>
                      {subtitle && (
                        <p
                          className="text-sm mt-1"
                          style={{ color: theme.colors.text.secondary }}
                        >
                          {subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="p-2 rounded-full transition-all"
                      style={{ color: theme.colors.text.disabled }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = theme.colors.text.primary;
                        e.currentTarget.style.background =
                          theme.colors.background.surface;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color =
                          theme.colors.text.disabled;
                        e.currentTarget.style.background = "transparent";
                      }}
                      aria-label="Cerrar"
                    >
                      <AiOutlineClose size={24} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div
              className="flex-1 overflow-y-auto"
              style={{ maxHeight: "calc(90vh - 140px)" }}
            >
              <div className="p-6">{children}</div>
            </div>

            {/* Footer */}
            {footer && (
              <div
                className={`sticky bottom-0 z-10 border-t px-6 py-4 ${footerClassName}`}
                style={{
                  background: theme.colors.background.card,
                  borderTopColor: theme.colors.border.DEFAULT,
                }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomModal;
