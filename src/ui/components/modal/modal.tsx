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
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(12px)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="relative flex flex-col overflow-hidden"
            style={{
              background: theme.colors.background.card,
              height: "100vh",
              width: "100vw",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 400,
              mass: 0.8,
            }}
          >
            {/* Header elegante con efecto vidrio y borde sutil */}
            <div
              className={`sticky top-0 z-10 ${headerClassName}`}
              style={{
                background: theme.colors.primary[600],
                borderBottom: `1px solid ${theme.colors.border.DEFAULT}40`,
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              }}
            >
              <div className="px-8 py-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {titleIcon && (
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-full"
                        style={{
                          background: `${theme.colors.primary}15`,
                          color: theme.colors.primary,
                        }}
                      >
                        {titleIcon}
                      </div>
                    )}
                    <div>
                      <motion.h1
                        className="text-3xl font-semibold tracking-tight"
                        style={{ color: theme.colors.text.primary }}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.05 }}
                      >
                        {title}
                      </motion.h1>
                      {subtitle && (
                        <motion.p
                          className="text-sm mt-1.5"
                          style={{ color: theme.colors.text.secondary }}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          {subtitle}
                        </motion.p>
                      )}
                    </div>
                  </div>
                  {showCloseButton && (
                    <motion.button
                      onClick={onClose}
                      className="p-2 rounded-full transition-all duration-200"
                      style={{ color: theme.colors.text.secondary }}
                      whileHover={{
                        scale: 1.1,
                        backgroundColor: `${theme.colors.background.page}30`,
                        color: theme.colors.text.primary,
                      }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Cerrar"
                    >
                      <AiOutlineClose size={22} style={{color:"black"}} />
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            {/* Contenido principal con scroll personalizado */}
            <div
              className="flex-1 overflow-y-auto custom-scroll"
              style={{
                maxHeight: "calc(100vh - 140px)",
                scrollbarWidth: "thin",
              }}
            >
              <div className="px-8 py-6">{children}</div>
            </div>

            {/* Footer elegante con sombra superior */}
            {footer && (
              <motion.div
                className={`sticky bottom-0 z-10 px-8 py-4 ${footerClassName}`}
                style={{
                  background: `linear-gradient(to top, ${theme.colors.background.card}, ${theme.colors.background.surface})`,
                  borderTop: `1px solid ${theme.colors.border.DEFAULT}40`,
                  boxShadow: "0 -2px 10px rgba(0,0,0,0.02)",
                }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {footer}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Agrega estos estilos globales o en tu CSS modules para el scroll personalizado
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .custom-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scroll::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
  }
  .custom-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
`;
if (!document.head.querySelector("#modal-scroll-styles")) {
  styleSheet.id = "modal-scroll-styles";
  document.head.appendChild(styleSheet);
}

export default CustomModal;
