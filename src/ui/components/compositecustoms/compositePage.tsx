// src/components/compositePage.tsx
import { useState, type ReactNode } from "react";
import { AiOutlineClose, AiOutlineExpandAlt } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import { useWindowSize } from "../../../hooks/windossize";
import { theme } from "../../../config/themes";

type Direction = "izq" | "der" | "modal";

interface PropsCompositePage {
  table?: () => ReactNode;
  form?: () => ReactNode;
  tableDirection?: Direction;
  formDirection?: Direction;
  isOpen?: boolean;
  onClose?: () => void;
  modalTitle?: string;
  fullModal?: boolean;
  // Nuevas props para personalizar el modal
  modalHeader?: ReactNode;
  modalFooter?: ReactNode;
  modalBodyClassName?: string;
  hideDefaultHeader?: boolean;
  hideDefaultFooter?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  saveButtonText?: string;
  cancelButtonText?: string;
  isSaving?: boolean;
}

const CompositePage: React.FC<PropsCompositePage> = ({
  table,
  form,
  tableDirection = "izq",
  formDirection = "der",
  isOpen,
  onClose,
  modalTitle,
  fullModal = true,
  modalHeader,
  modalFooter,
  modalBodyClassName = "",
  hideDefaultHeader = false,
  hideDefaultFooter = false,
  onSave,
  onCancel,
  saveButtonText = "Guardar",
  cancelButtonText = "Cancelar",
  isSaving = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const { width: windowWidth } = useWindowSize();

  const isMobile = windowWidth < 1024;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
      setIsClosing(false);
      setIsExpanded(false);
    }, 100);
  };

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const CloseButton = ({ mobile = false }: { mobile?: boolean }) => {
    if (mobile) {
      return (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleClose();
          }}
          className="fixed top-6 right-4 z-50 w-14 h-14 flex items-center justify-center rounded-full shadow-xl active:scale-95 transition-transform"
          style={{
            background: theme.colors.background.card,
            border: `2px solid ${theme.colors.border.DEFAULT}`,
            WebkitTapHighlightColor: "transparent",
            cursor: "pointer",
            touchAction: "manipulation",
            pointerEvents: "auto",
          }}
          aria-label="Cerrar modal"
        >
          <AiOutlineClose
            size={24}
            style={{ color: theme.colors.text.primary }}
          />
        </button>
      );
    }
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleClose();
        }}
        className="p-2 transition-colors rounded-lg"
        style={{ color: theme.colors.text.inverse }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        title="Cerrar"
      >
        <AiOutlineClose size={18} />
      </button>
    );
  };

  const DefaultFooter = () => (
    <div
      className="flex justify-end gap-3 p-4 border-t"
      style={{
        borderTopColor: theme.colors.border.DEFAULT,
        background: theme.colors.background.surface,
      }}
    >
      {onCancel && (
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium transition-colors rounded-lg"
          style={{
            color: theme.colors.text.secondary,
            background: theme.colors.background.card,
            border: `1px solid ${theme.colors.border.DEFAULT}`,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background =
              theme.colors.background.surfaceHover)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = theme.colors.background.card)
          }
        >
          {cancelButtonText}
        </button>
      )}
      {onSave && (
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg"
          style={{
            background: theme.colors.primary.DEFAULT,
            opacity: isSaving ? 0.6 : 1,
            cursor: isSaving ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => {
            if (!isSaving)
              e.currentTarget.style.background = theme.colors.primary.dark;
          }}
          onMouseLeave={(e) => {
            if (!isSaving)
              e.currentTarget.style.background = theme.colors.primary.DEFAULT;
          }}
        >
          {isSaving ? "Guardando..." : saveButtonText}
        </button>
      )}
    </div>
  );

  const renderModalContent = (content?: () => ReactNode) => {
    if (!isOpen || !content) return null;

    const getBodyHeight = () => {
      if (isMobile) return `calc(100vh - 160px)`;
      if (isTablet) return `calc(90vh - 120px)`;
      return isExpanded ? `calc(100vh - 120px)` : `calc(90vh - 120px)`;
    };

    // Mobile
    if (isMobile) {
      return (
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[600]">
              <motion.div
                className="absolute inset-0 backdrop-blur-sm"
                style={{ background: "rgba(0, 0, 0, 0.5)" }}
                onClick={handleClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
                <div className="pointer-events-auto">
                  <CloseButton mobile />
                </div>
              </div>
              <motion.div
                className="absolute bottom-0 left-0 right-0 rounded-t-3xl z-40 overflow-hidden flex flex-col"
                style={{
                  background: theme.colors.background.card,
                  boxShadow: theme.shadows.dropdown,
                  height: "100vh",
                  maxHeight: "100vh",
                  paddingTop: "env(safe-area-inset-top, 0px)",
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
                {!hideDefaultHeader && (
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.primary.DEFAULT}, ${theme.colors.primary.dark})`,
                      borderTopLeftRadius: "24px",
                      borderTopRightRadius: "24px",
                    }}
                  >
                    <motion.div
                      className="flex justify-center pt-6 pb-2 cursor-grab active:cursor-grabbing"
                      drag="y"
                      dragConstraints={{ top: 0, bottom: 0 }}
                      dragElastic={0.2}
                      onDragEnd={(_, info) => {
                        if (info.offset.y > 100 || info.velocity.y > 500)
                          handleClose();
                      }}
                      style={{
                        touchAction: "pan-y",
                        WebkitUserSelect: "none",
                        userSelect: "none",
                      }}
                    >
                      <div
                        className="w-24 h-1.5 rounded-full"
                        style={{ background: "rgba(255,255,255,0.5)" }}
                      />
                    </motion.div>
                    <div className="px-6 pt-0 pb-4">
                      <h2
                        className="text-xl font-bold truncate pr-16"
                        style={{ color: theme.colors.text.inverse }}
                      >
                        {modalTitle || ""}
                      </h2>
                    </div>
                  </div>
                )}
                {modalHeader && (
                  <div className="flex-shrink-0">{modalHeader}</div>
                )}
                <div
                  className={`flex-1 overflow-y-auto ${modalBodyClassName}`}
                  style={{
                    height: getBodyHeight(),
                    WebkitOverflowScrolling: "touch",
                    background: theme.colors.background.card,
                  }}
                >
                  <div className="px-6 py-4 pb-8">{content()}</div>
                </div>
                {!hideDefaultFooter && <DefaultFooter />}
                {modalFooter && (
                  <div className="flex-shrink-0">{modalFooter}</div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      );
    }

    // Tablet / Desktop
    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[300]">
            <motion.div
              className="absolute inset-0 backdrop-blur-sm"
              style={{ background: "rgba(0, 0, 0, 0.5)" }}
              onClick={handleClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className={`absolute bottom-0 overflow-hidden flex flex-col ${
                isTablet
                  ? "rounded-t-3xl left-0 right-0"
                  : "rounded-none inset-0"
              }`}
              style={{
                background: theme.colors.background.card,
                boxShadow: theme.shadows.lg,
                height: isTablet ? "90vh" : isExpanded ? "100vh" : "100vh",
                maxWidth: isTablet ? "100%" : isExpanded ? "100%" : "100%",
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
              {!hideDefaultHeader && (
                <div
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary.DEFAULT}, ${theme.colors.primary.dark})`,
                  }}
                >
                  <motion.div
                    className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={0.1}
                    onDragEnd={(_, info) => {
                      if (info.offset.y > 150 || info.velocity.y > 600)
                        handleClose();
                    }}
                  >
                    <div
                      className="w-20 h-1.5 rounded-full transition-colors"
                      style={{ background: "rgba(255,255,255,0.5)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,0.8)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,0.5)")
                      }
                    />
                  </motion.div>
                  <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3">
                    <h2
                      className="text-xl font-bold truncate"
                      style={{ color: theme.colors.text.inverse }}
                    >
                      {modalTitle || ""}
                    </h2>
                    <div className="flex items-center gap-2">
                      {fullModal && (
                        <button
                          onClick={toggleExpand}
                          className="p-2 transition-colors rounded-lg"
                          style={{ color: theme.colors.text.inverse }}
                          title={isExpanded ? "Reducir" : "Expandir"}
                        >
                          <AiOutlineExpandAlt size={18} />
                        </button>
                      )}
                      <CloseButton />
                    </div>
                  </div>
                </div>
              )}
              {modalHeader && (
                <div className="flex-shrink-0">{modalHeader}</div>
              )}
              <div
                className={`flex-1 overflow-y-auto ${modalBodyClassName}`}
                style={{
                  height: getBodyHeight(),
                  background: theme.colors.background.card,
                }}
              >
                <div className="p-6">{content()}</div>
              </div>
              {!hideDefaultFooter && <DefaultFooter />}
              {modalFooter && (
                <div className="flex-shrink-0">{modalFooter}</div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  // Layout de dos columnas (table + form)
  const bothVisible =
    (tableDirection === "izq" || tableDirection === "der") &&
    (formDirection === "izq" || formDirection === "der") &&
    tableDirection !== formDirection;

  const getLeftWidth = () => {
    if (!bothVisible) return "w-full";
    return tableDirection === "izq" ? "w-full lg:w-3/4" : "w-full lg:w-1/4";
  };

  const getRightWidth = () => {
    if (!bothVisible) return "w-full";
    return tableDirection === "der" ? "w-full lg:w-3/4" : "w-full lg:w-1/4";
  };

  return (
    <>
      <div
        className={`flex flex-col ${bothVisible ? "lg:flex-row" : ""} gap-3 sm:gap-4 w-full`}
      >
        {(tableDirection === "izq" || formDirection === "izq") && (
          <div
            className={`${getLeftWidth()} min-w-0 transition-all duration-300`}
          >
            <div
              className="overflow-hidden rounded-lg shadow-sm"
              style={{
                background: theme.colors.background.card,
                boxShadow: theme.shadows.sm,
              }}
            >
              {tableDirection === "izq" && table?.()}
              {formDirection === "izq" && form?.()}
            </div>
          </div>
        )}
        {(tableDirection === "der" || formDirection === "der") && (
          <div
            className={`${getRightWidth()} min-w-0 transition-all duration-300`}
          >
            <div
              className="overflow-hidden rounded-lg shadow-sm"
              style={{
                background: theme.colors.background.card,
                boxShadow: theme.shadows.sm,
              }}
            >
              {formDirection === "der" && form?.()}
              {tableDirection === "der" && table?.()}
            </div>
          </div>
        )}
      </div>
      {tableDirection === "modal" && renderModalContent(table)}
      {formDirection === "modal" && renderModalContent(form)}
    </>
  );
};

export default CompositePage;
