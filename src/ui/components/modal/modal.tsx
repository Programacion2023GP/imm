// CustomModal.tsx
import { ReactNode, useEffect, useState } from "react";
import { AiOutlineClose, AiOutlineExpandAlt } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import { theme } from "../../../config/themes";
import { useWindowSize } from "../../../hooks/windossize";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string | ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  showCloseButton?: boolean;
  titleIcon?: ReactNode;
  subtitle?: string;
  headerClassName?: string;
  footerClassName?: string;
  zIndex?: number | string;
  closeOnBackdropClick?: boolean;
  fullModal?: boolean;
  hideDefaultFooter?: boolean;
  expand?: boolean;
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
  zIndex = 300,
  closeOnBackdropClick = true,
  fullModal = false,
  hideDefaultFooter = false,
  expand = false,
}: ModalProps) => {
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 768;
  const [isExpanded, setIsExpanded] = useState(expand);

  // El z-index del botón de cierre flotante en móvil debe estar por encima del modal
  const closeButtonZIndex =
    typeof zIndex === "number" ? zIndex + 10 : `calc(${zIndex} + 10)`;

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

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const getBodyHeight = () => {
    if (isMobile) return `calc(100vh - 140px)`;
    if (fullModal || isExpanded) return `calc(100vh - 120px)`;
    return `calc(80vh - 120px)`;
  };

  const headerStyle = {
    background: `linear-gradient(135deg, ${theme.colors.primary.DEFAULT}, ${theme.colors.primary.dark})`,
    borderBottom: `1px solid ${theme.colors.border.DEFAULT}40`,
  };

  const CloseButton = ({ floating = false }: { floating?: boolean }) => {
    if (floating) {
      return (
        <button
          onClick={onClose}
          className="w-14 h-14 flex items-center justify-center rounded-full shadow-xl active:scale-95 transition-transform"
          style={{
            background: theme.colors.background.card,
            border: `2px solid ${theme.colors.border.DEFAULT}`,
            WebkitTapHighlightColor: "transparent",
            cursor: "pointer",
            touchAction: "manipulation",
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
        onClick={onClose}
        className="p-2 transition-colors rounded-lg"
        style={{ color: theme.colors.text.inverse }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        aria-label="Cerrar"
      >
        <AiOutlineClose size={18} />
      </button>
    );
  };

  const ExpandButton = () => (
    <button
      onClick={toggleExpand}
      className="p-2 transition-colors rounded-lg"
      style={{ color: theme.colors.text.inverse }}
      title={isExpanded ? "Reducir" : "Expandir"}
    >
      <AiOutlineExpandAlt size={18} />
    </button>
  );

  const renderMobile = () => (
    // ✅ zIndex aplicado via style, no hardcodeado
    <div className="fixed inset-0" style={{ zIndex }}>
      <motion.div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "rgba(0, 0, 0, 0.5)" }}
        onClick={handleBackdropClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* ✅ Botón flotante de cierre también usa el zIndex dinámico */}
      <div
        className="fixed top-6 right-4 pointer-events-none"
        style={{ zIndex: closeButtonZIndex }}
      >
        <div className="pointer-events-auto">
          <CloseButton floating />
        </div>
      </div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 rounded-t-3xl overflow-hidden flex flex-col"
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
        transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
      >
        <div style={headerStyle}>
          <div className="flex justify-center pt-6 pb-2 cursor-grab active:cursor-grabbing">
            <div
              className="w-24 h-1.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.5)" }}
            />
          </div>
          <div className="px-6 pt-0 pb-4">
            <h2
              className="text-xl font-bold truncate pr-16"
              style={{ color: theme.colors.text.inverse }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className="text-sm mt-1 opacity-80"
                style={{ color: theme.colors.text.inverse }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto"
          style={{
            height: getBodyHeight(),
            WebkitOverflowScrolling: "touch",
            background: theme.colors.background.card,
          }}
        >
          <div className="px-6 py-4 pb-8">{children}</div>
        </div>

        {!hideDefaultFooter && footer && (
          <div className="flex-shrink-0">{footer}</div>
        )}
        {!hideDefaultFooter && !footer && (
          <div
            className="px-6 py-4 border-t"
            style={{ borderTopColor: theme.colors.border.DEFAULT }}
          />
        )}
      </motion.div>
    </div>
  );

  const renderDesktop = () => (
    // ✅ zIndex aplicado via style, no hardcodeado
    <div className="fixed inset-0" style={{ zIndex }}>
      <motion.div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "rgba(0, 0, 0, 0.5)" }}
        onClick={handleBackdropClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          className="pointer-events-auto flex flex-col overflow-hidden rounded-xl"
          style={{
            background: theme.colors.background.card,
            boxShadow: theme.shadows.xl,
            width: fullModal && !isExpanded ? "90vw" : "800px",
            maxWidth: "90vw",
            height: fullModal && isExpanded ? "90vh" : "auto",
            maxHeight: "90vh",
          }}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{
            type: "spring",
            damping: 30,
            stiffness: 400,
            mass: 0.8,
          }}
        >
          {/* Header */}
          <div style={headerStyle} className={headerClassName}>
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                {titleIcon && (
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-full"
                    style={{ background: "rgba(255,255,255,0.2)" }}
                  >
                    {titleIcon}
                  </div>
                )}
                <div>
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: theme.colors.text.inverse }}
                  >
                    {title}
                  </h2>
                  {subtitle && (
                    <p
                      className="text-sm opacity-80"
                      style={{ color: theme.colors.text.inverse }}
                    >
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {fullModal && <ExpandButton />}
                {showCloseButton && <CloseButton />}
              </div>
            </div>
          </div>

          {/* Body */}
          <div
            className="flex-1 overflow-y-auto"
            style={{
              height: getBodyHeight(),
              maxHeight: "calc(90vh - 120px)",
              background: theme.colors.background.card,
            }}
          >
            <div className="p-6">{children}</div>
          </div>

          {/* Footer */}
          {footer && (
            <div
              className={`px-6 py-4 border-t ${footerClassName}`}
              style={{
                borderTopColor: theme.colors.border.DEFAULT,
                background: theme.colors.background.surface,
              }}
            >
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (isMobile ? renderMobile() : renderDesktop())}
    </AnimatePresence>
  );
};

export default CustomModal;
