import React, { useState, useRef, useEffect, type ReactNode } from "react";
import { theme } from "../../../config/themes";

type UserCardProps = {
  avatar?: string | ReactNode;
  title: string;
  subtitle?: string;
  children?: () => ReactNode;
  actions?: ReactNode; // Ahora es ReactNode directo, no función
  footerActions?: ReactNode; // Nuevo: acciones en el footer
  variant?: "default" | "elevated" | "outlined";
  size?: "sm" | "md" | "lg";
};

const CustomCard: React.FC<UserCardProps> = ({
  avatar,
  title,
  subtitle,
  children,
  actions, // Acciones en el header (dropdown)
  footerActions, // ✅ NUEVO: acciones en el footer
  variant = "default",
  size = "md",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasChildren = !!children;
  const hasFooterActions = !!footerActions;

  // Tamaños dinámicos
  const sizeStyles = {
    sm: { padding: "p-3", titleSize: "text-sm", avatarSize: "w-8 h-8" },
    md: { padding: "p-4", titleSize: "text-base", avatarSize: "w-10 h-10" },
    lg: { padding: "p-6", titleSize: "text-lg", avatarSize: "w-12 h-12" },
  };

  const currentSize = sizeStyles[size];

  // Variantes visuales
  const variantStyles = {
    default: {
      border: `1px solid ${theme.colors.border.DEFAULT}`,
      shadow: isHovered ? theme.shadows.lg : theme.shadows.card,
    },
    elevated: {
      border: "none",
      shadow: isHovered ? theme.shadows.xl : theme.shadows.md,
    },
    outlined: {
      border: `2px solid ${theme.colors.primary.DEFAULT}`,
      shadow: "none",
    },
  };

  const currentVariant = variantStyles[variant];

  // Renderizar avatar
  const renderAvatar = () => {
    if (!avatar) return null;
    if (typeof avatar === "string") {
      return (
        <img
          src={avatar}
          alt="avatar"
          className={`${currentSize.avatarSize} rounded-full object-cover flex-shrink-0`}
          style={{ border: `2px solid ${theme.colors.border.light}` }}
        />
      );
    }
    return <div className="flex-shrink-0">{avatar}</div>;
  };

  return (
    <div
      className={`${currentSize.padding} rounded-xl flex flex-col overflow-hidden relative transition-all duration-200`}
      style={{
        background: theme.colors.background.card,
        ...currentVariant,
        transition: `box-shadow ${theme.transitions.normal}, transform ${theme.transitions.fast}`,
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Línea decorativa superior con gradiente */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(90deg, ${theme.colors.primary.DEFAULT}, ${theme.colors.primary.light})`,
        }}
      />

      {/* HEADER: Avatar + Título + Subtítulo */}
      <div className="flex items-start gap-3 relative mt-1">
        {renderAvatar()}
        <div className="flex flex-col flex-1 min-w-0">
          <div
            className={`${currentSize.titleSize} font-semibold leading-tight`}
            style={{ color: theme.colors.text.primary }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              className="text-sm leading-tight mt-0.5"
              style={{ color: theme.colors.text.secondary }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* BODY: Contenido principal */}
      {hasChildren && (
        <div
          className="mt-3 text-sm leading-relaxed"
          style={{ color: theme.colors.text.secondary }}
        >
          {typeof children === "function" ? children() : children}
        </div>
      )}

      {/* FOOTER: Acciones principales */}
      {hasFooterActions && (
        <div
          className="mt-4 pt-3 flex items-center gap-2 flex-wrap border-t"
          style={{
            borderColor: theme.colors.border.light,
          }}
        >
          {footerActions}
        </div>
      )}
    </div>
  );
};

export default CustomCard;
