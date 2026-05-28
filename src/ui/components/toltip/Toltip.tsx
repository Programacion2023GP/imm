import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { theme } from "../../../config/themes"; // Ajusta la ruta según tu estructura

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
  maxWidth?: number;
}

// Helper para convertir hex a rgba
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = "top",
  delay = 200,
  className = "",
  maxWidth = 280,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [showDelayed, setShowDelayed] = useState(false);
  const [calculatedPosition, setCalculatedPosition] = useState(position);

  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Delay para mostrar/ocultar ──
  useEffect(() => {
    if (isVisible) {
      timeoutRef.current = setTimeout(() => {
        setShowDelayed(true);
      }, delay);
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setShowDelayed(false);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isVisible, delay]);

  // ── Actualizar posición al mostrar ──
  useEffect(() => {
    if (showDelayed && triggerRef.current) {
      updatePosition();
      window.addEventListener("scroll", updatePosition);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [showDelayed, position, calculatedPosition]);

  // ── Calcular posición inteligente ──
  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    let top = 0;
    let left = 0;
    let finalPosition = position;
    const spacing = 8;
    const viewportPadding = 12;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Probar posición preferida y luego alternativas
    const positions = [position, ...getAlternativePositions(position)];

    for (const pos of positions) {
      let tempTop = 0;
      let tempLeft = 0;

      switch (pos) {
        case "top":
          tempTop = triggerRect.top + scrollY - tooltipRect.height - spacing;
          tempLeft = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case "bottom":
          tempTop = triggerRect.bottom + scrollY + spacing;
          tempLeft = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case "left":
          tempTop = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
          tempLeft = triggerRect.left + scrollX - tooltipRect.width - spacing;
          break;
        case "right":
          tempTop = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
          tempLeft = triggerRect.right + scrollX + spacing;
          break;
      }

      if (
        isPositionValid(tempTop, tempLeft, tooltipRect, triggerRect, scrollX, scrollY, viewportWidth, viewportHeight, viewportPadding)
      ) {
        top = tempTop;
        left = tempLeft;
        finalPosition = pos as "top" | "bottom" | "left" | "right";
        break;
      }
    }

    // Fallback con límites del viewport
    if (!finalPosition) {
      switch (position) {
        case "top":
          top = triggerRect.top + scrollY - tooltipRect.height - spacing;
          left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case "bottom":
          top = triggerRect.bottom + scrollY + spacing;
          left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
          break;
        default:
          top = triggerRect.bottom + scrollY + spacing;
          left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
      }

      left = Math.max(scrollX + viewportPadding, Math.min(left, scrollX + viewportWidth - tooltipRect.width - viewportPadding));
      top = Math.max(scrollY + viewportPadding, Math.min(top, scrollY + viewportHeight - tooltipRect.height - viewportPadding));
    }

    setTooltipPosition({ top, left });
    setCalculatedPosition(finalPosition);
  };

  // ── Validar si una posición es válida ──
  const isPositionValid = (
    top: number,
    left: number,
    tooltipRect: DOMRect,
    triggerRect: DOMRect,
    scrollX: number,
    scrollY: number,
    viewportWidth: number,
    viewportHeight: number,
    padding: number
  ): boolean => {
    // Verificar límites del viewport
    if (left < scrollX + padding || left + tooltipRect.width > scrollX + viewportWidth - padding) return false;
    if (top < scrollY + padding || top + tooltipRect.height > scrollY + viewportHeight - padding) return false;

    // Verificar que no cubra demasiado el trigger
    const tooltipRight = left + tooltipRect.width;
    const tooltipBottom = top + tooltipRect.height;
    const triggerRight = triggerRect.left + scrollX + triggerRect.width;
    const triggerBottom = triggerRect.top + scrollY + triggerRect.height;
    const minOverlap = 10;

    if (left < triggerRight && tooltipRight > triggerRect.left + scrollX) {
      if (top < triggerBottom && tooltipBottom > triggerRect.top + scrollY) {
        const overlapWidth = Math.min(triggerRight, tooltipRight) - Math.max(triggerRect.left + scrollX, left);
        const overlapHeight = Math.min(triggerBottom, tooltipBottom) - Math.max(triggerRect.top + scrollY, top);

        if (overlapWidth > minOverlap && overlapHeight > minOverlap) {
          return false;
        }
      }
    }
    return true;
  };

  // ── Obtener posiciones alternativas ──
  const getAlternativePositions = (preferred: string): string[] => {
    return ["top", "bottom", "left", "right"].filter((p) => p !== preferred);
  };

  const handleMouseEnter = () => setIsVisible(true);
  const handleMouseLeave = () => setIsVisible(false);

  // ── Estilos de la flecha según posición calculada ──
  const getArrowStyle = (): React.CSSProperties => {
    const arrowSize = 8;
    const arrowColor = hexToRgba(theme.colors.neutral[900], 0.95 );

    const baseArrow: React.CSSProperties = {
      position: "absolute",
      width: arrowSize,
      height: arrowSize,
      backgroundColor: arrowColor,
      border: `1px solid ${theme.colors.neutral[700]}`,
    };

    switch (calculatedPosition) {
      case "top":
        return {
          ...baseArrow,
          bottom: -arrowSize / 2,
          left: "50%",
          marginLeft: -arrowSize / 2,
          borderRightColor: theme.colors.neutral[700],
          borderBottomColor: theme.colors.neutral[700],
          borderTopColor: "transparent",
          borderLeftColor: "transparent",
        };
      case "bottom":
        return {
          ...baseArrow,
          top: -arrowSize / 2,
          left: "50%",
          marginLeft: -arrowSize / 2,
          borderTopColor: theme.colors.neutral[700],
          borderLeftColor: theme.colors.neutral[700],
          borderRightColor: "transparent",
          borderBottomColor: "transparent",
        };
      case "left":
        return {
          ...baseArrow,
          right: -arrowSize / 2,
          top: "50%",
          marginTop: -arrowSize / 2,
          borderTopColor: theme.colors.neutral[700],
          borderRightColor: theme.colors.neutral[700],
          borderBottomColor: "transparent",
          borderLeftColor: "transparent",
        };
      case "right":
        return {
          ...baseArrow,
          left: -arrowSize / 2,
          top: "50%",
          marginTop: -arrowSize / 2,
          borderBottomColor: theme.colors.neutral[700],
          borderLeftColor: theme.colors.neutral[700],
          borderTopColor: "transparent",
          borderRightColor: "transparent",
        };
      default:
        return baseArrow;
    }
  };

  return (
    <div
      ref={triggerRef}
      className={`inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}

      {showDelayed &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            style={{
              position: "absolute",
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              zIndex: theme.zIndex.tooltip,
              maxWidth: `${maxWidth}px`,
              backgroundColor: hexToRgba(theme.colors.neutral[900], 0.95),
              backdropFilter: "blur(4px)",
              color: theme.colors.text.inverse,
              border: `1px solid ${theme.colors.neutral[700]}`,
              borderRadius: theme.radius.lg,
              padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
              fontSize: theme.typography.fontSize.sm,
              lineHeight: theme.typography.lineHeight.relaxed,
              fontWeight: theme.typography.fontWeight.medium,
              boxShadow: theme.shadows.dropdown,
              pointerEvents: "none",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
            className="animate-in fade-in zoom-in-95 duration-150"
          >
            {content}
            {/* Flecha decorativa */}
            <div style={getArrowStyle()} />
          </div>,
          document.body
        )}
    </div>
  );
};

export default Tooltip;