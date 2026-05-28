// components/sidebar/Sidebar.tsx
import { type ReactNode } from "react";
import { theme } from "../../../config/themes"; // Ajusta la ruta según tu estructura

interface SidebarProps {
  children: ReactNode;
  name?: string;
  borderR?: boolean;
}

export const Sidebar = ({ name, children }: SidebarProps) => {
  // Colores primarios del tema
  const primary = theme.colors.primary.DEFAULT; // #9B2242
  const primaryDark = theme.colors.primary.dark; // #701832
  const neutral300 = theme.colors.neutral[300]; // #B8B6AF
  const neutral900 = theme.colors.neutral[900]; // #2D3035

  // Función auxiliar para convertir hex a rgba (para las opacidades)
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  return (
    <aside
      style={{
        width: "260px",
        minWidth: "260px",
        height: "100vh",
        background: theme.colors.primary[700],
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        borderRight: `1px solid ${hexToRgba(primary, 0.2)}`,
      }}
    >
      {/* Ambient glow top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "200px",
          height: "200px",
          background: `radial-gradient(circle, ${hexToRgba(primary, 0.2)} 0%, transparent 70%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Logo area */}
      <div
        style={{
          padding: `${theme.spacing[6]} ${theme.spacing[5]} ${theme.spacing[5]}`,
          borderBottom: `1px solid ${hexToRgba(primary, 0.15)}`,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Aquí puedes colocar tu logo */}
      </div>

      {/* Navigation - Aquí se renderizan los items */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
          position: "relative",
          zIndex: 1,
        }}
      >
        <p
          style={{
            color: hexToRgba(neutral300, 0.35),
            fontSize: theme.typography.fontSize.xs,
            fontWeight: theme.typography.fontWeight.bold,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginBottom: theme.spacing[2],
            paddingLeft: theme.spacing[3],
          }}
        >
          NAVEGACIÓN
        </p>

        {/* Renderizar los children aquí */}
        {children}
      </nav>

      {/* Bottom section */}
      <div
        style={{
          padding: theme.spacing[3],
          borderTop: `1px solid ${hexToRgba(primary, 0.15)}`,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            background: hexToRgba(primary, 0.1),
            border: `1px solid ${hexToRgba(primary, 0.2)}`,
            borderRadius: theme.radius.xl,
            padding: theme.spacing[3],
            display: "flex",
            alignItems: "center",
            gap: theme.spacing[2.5], // 10px aproximadamente
            color: theme.colors.text.inverse,
            fontFamily: theme.typography.fontFamily,
            fontSize: theme.typography.fontSize.sm,
          }}
        >
          {name}
        </div>
      </div>
    </aside>
  );
};
