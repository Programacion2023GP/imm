// components/sidebar/SidebarItem.tsx
import { useState, type ReactNode } from "react";
import { theme } from "../../../config/themes"; // Ajusta la ruta según tu estructura

interface SidebarItemProps {
  icon?: ReactNode;
  label: string;
  active?: boolean;
  route?: string;
  id?: string | number;
  onClick?: () => void;
}

// Helper para convertir hex a rgba (misma función que en los otros componentes)
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

export const SidebarItem = ({
  icon,
  label,
  active,
  onClick,
  id,
}: SidebarItemProps) => {
  const [hovered, setHovered] = useState(false);

  const primary = theme.colors.primary.DEFAULT; // #9B2242
  const primaryDark = theme.colors.primary.dark; // #701832 (usado en el gradiente activo)

  return (
    <button
      id={id?.toString()}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "9px 12px", // se mantiene igual, podrías usar theme.spacing[2] y [3] (8px 12px)
        background: active
          ? `linear-gradient(135deg, ${primary} 0%, ${primaryDark} 100%)`
          : hovered
            ? hexToRgba(primary, 0.25)
            : "transparent",
        border: "none",
        borderRadius: theme.radius.lg, // 10px
        color: theme.colors.text.inverse, // blanco
        cursor: "pointer",
        transition: theme.transitions.normal, // 200ms cubic-bezier(0.4,0,0.2,1)
        fontSize: theme.typography.fontSize.sm, // 0.875rem (≈14px, muy cercano a 13.5)
        fontWeight: active
          ? theme.typography.fontWeight.semibold // 600
          : theme.typography.fontWeight.normal, // 400
        fontFamily: theme.typography.fontFamily,
        textAlign: "left",
        boxShadow: active ? `0 4px 15px ${hexToRgba(primary, 0.35)}` : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Indicador lateral de elemento activo */}
      {active && (
        <span
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: "3px",
            height: "65%",
            background: hexToRgba(theme.colors.text.inverse, 0.9),
            borderRadius: "0 3px 3px 0",
          }}
        />
      )}

      {/* Icono */}
      {icon && (
        <span
          style={{
            display: "flex",
            opacity: active ? 1 : 0.7,
            transition: "opacity 0.2s",
          }}
        >
          {icon}
        </span>
      )}

      {/* Texto */}
      <span>{label}</span>
    </button>
  );
};
