// CustomBox.tsx
import React, { ReactNode } from "react";
import { theme } from "../../../config/themes";

export interface CustomBoxProps {
  title: string;
  children: ReactNode;
  className?: string;
  noMargin?: boolean;
  icon?: ReactNode;
}

const CustomBox: React.FC<CustomBoxProps> = ({
  title,
  children,
  className = "",
  noMargin = false,
  icon,
}) => {
  const primaryColor = theme.colors.primary.DEFAULT; // #9B2242
  const primaryDark = theme.colors.primary[700] || "#7D1B35";
  const borderColor = theme.colors.border.DEFAULT;

  const marginBottom = noMargin ? 0 : 24;

  return (
    <div
      className={className + ' w-full'}
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: theme.radius.lg,
        background: theme.colors.background.card,
        boxShadow: theme.shadows.md,
        overflow: "hidden",
        marginBottom,
      }}
    >
      {/* Header exactamente como el del modal en CompositePage */}
      <div
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryDark} 100%)`,
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          borderBottom: `1px solid ${primaryDark}`,
        }}
      >
        {icon && (
          <span
            style={{ color: "white", display: "flex", alignItems: "center" }}
          >
            {icon}
          </span>
        )}
        <span
          style={{
            fontSize: theme.typography.fontSize.base,
            fontWeight: 600,
            color: "#FFFFFF",
            letterSpacing: "0.3px",
          }}
        >
          {title}
        </span>
      </div>

      {/* Contenido */}
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );
};

export default CustomBox;
