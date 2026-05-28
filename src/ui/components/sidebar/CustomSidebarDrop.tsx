// components/sidebar/SidebarDrop.tsx
import { ChevronRight } from "lucide-react";
import { useState, useRef, type ReactNode } from "react";
import { theme } from "../../../config/themes"; // Ajusta la ruta según tu estructura

interface SidebarDropProps {
  icon?: ReactNode;
  id?: string | number;
  label: string;
  children: ReactNode;
}

// Helper para convertir hex a rgba (mismo que en Sidebar)
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

export const SidebarDrop = ({
  icon,
  label,
  children,
  id,
}: SidebarDropProps) => {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const primary = theme.colors.primary.DEFAULT; // #9B2242

  return (
    <div style={{ marginBottom: "2px" }}>
      <button
        id={id?.toString()}
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px", // podría ser theme.spacing[2.5] y [3], pero mantengo el valor exacto
          background: open ? hexToRgba(primary, 0.5) : "transparent",
          border: "none",
          borderRadius: theme.radius.lg, // 10px
          color: theme.colors.text.inverse, // blanco puro, puedes añadir opacidad si quieres
          cursor: "pointer",
          transition: theme.transitions.normal,
          fontSize: theme.typography.fontSize.sm, // 0.875rem ≈ 14px (casi 13.5)
          fontWeight: theme.typography.fontWeight.medium, // 500
          fontFamily: theme.typography.fontFamily,
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.background = hexToRgba(primary, 0.3);
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.background = "transparent";
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ opacity: 0.8, display: "flex" }}>{icon}</span>
          <span>{label}</span>
        </div>
        <ChevronRight
          style={{
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        />
      </button>

      <div
        ref={contentRef}
        style={{
          maxHeight: open ? "500px" : "0",
          overflow: "hidden",
          transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
        }}
      >
        <div
          style={{
            marginLeft: theme.spacing[4], // 16px
            paddingLeft: theme.spacing[3], // 12px
            borderLeft: `1px solid ${hexToRgba(primary, 0.4)}`,
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            paddingTop: theme.spacing[1], // 4px
            paddingBottom: theme.spacing[2], // 8px
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
