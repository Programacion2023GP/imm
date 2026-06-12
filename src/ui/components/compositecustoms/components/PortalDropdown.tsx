// CompositeCrud/components/PortalDropdown.tsx
import  { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import type { PortalDropdownProps } from "../types";
import { theme } from "../../../../config/themes";

export const PortalDropdown = ({
  anchorRef,
  isOpen,
  onClose,
  children,
}: PortalDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    openUp: boolean;
  } | null>(null);

  // Calcular coordenadas cuando se abre
  useEffect(() => {
    if (!isOpen || !anchorRef.current) {
      setCoords(null);
      return;
    }
    const rect = anchorRef.current.getBoundingClientRect();
    const estimatedHeight = 200;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUp = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;
    setCoords({
      top: openUp ? undefined : rect.bottom + window.scrollY + 4,
      bottom: openUp
        ? window.innerHeight - rect.top - window.scrollY + 4
        : undefined,
      left: rect.right + window.scrollX,
      openUp,
    });
  }, [isOpen, anchorRef]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  // Cerrar al hacer scroll
  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = () => onClose();
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [isOpen, onClose]);

  if (!isOpen || !coords) return null;

  return ReactDOM.createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: "absolute",
        top: coords.top,
        bottom: coords.bottom,
        left: coords.left,
        transform: "translateX(-100%)",
        zIndex: theme.zIndex.portal,
        minWidth: "160px",
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.DEFAULT}`,
        borderRadius: theme.radius.md,
        boxShadow: theme.shadows.dropdown,
        overflow: "hidden",
      }}
    >
      <div className="py-1">{children}</div>
    </div>,
    document.body,
  );
};

export default PortalDropdown;
