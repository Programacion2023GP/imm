// Badge.tsx
import React from "react";
import { theme } from "../../../config/themes";

export type BadgeVariant = "solid" | "outline" | "soft" | "subtle" | "dot";
export type BadgeSize = "sm" | "md" | "lg";
export type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "neutral";

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: BadgeColor;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  removable?: boolean;
  onRemove?: () => void;
  dot?: boolean;
  pill?: boolean;
  pulse?: boolean;
}

const CustomBadge: React.FC<BadgeProps> = ({
  children,
  variant = "solid",
  size = "md",
  color = "primary",
  className = "",
  icon,
  iconPosition = "left",
  removable = false,
  onRemove,
  dot = false,
  pill = false,
  pulse = false,
}) => {
  const baseStyles =
    "inline-flex items-center font-medium transition-all duration-200";

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-sm gap-1.5",
    lg: "px-3 py-1.5 text-base gap-2",
  };

  const pillStyles = pill ? "rounded-full" : "rounded-lg";

  // Configuración de colores usando el tema
  const colorConfig = {
    primary: {
      solid: {
        bg: theme.colors.primary.DEFAULT,
        text: theme.colors.text.inverse,
        hover: theme.colors.primary.dark,
      },
      outline: {
        border: theme.colors.primary.DEFAULT,
        text: theme.colors.primary.DEFAULT,
        bg: "transparent",
        hover: theme.colors.feedback.primaryLight,
      },
      soft: {
        bg: theme.colors.feedback.primaryLight,
        text: theme.colors.primary.DEFAULT,
        hover: `${theme.colors.primary.DEFAULT}20`,
      },
      subtle: {
        bg: `${theme.colors.primary.DEFAULT}08`,
        text: theme.colors.primary.DEFAULT,
        hover: `${theme.colors.primary.DEFAULT}15`,
      },
      dot: theme.colors.primary.DEFAULT,
    },
    secondary: {
      solid: {
        bg: theme.colors.secondary.DEFAULT,
        text: theme.colors.text.inverse,
        hover: theme.colors.secondary.dark,
      },
      outline: {
        border: theme.colors.secondary.DEFAULT,
        text: theme.colors.secondary.DEFAULT,
        bg: "transparent",
        hover: `${theme.colors.secondary.DEFAULT}10`,
      },
      soft: {
        bg: `${theme.colors.secondary.DEFAULT}15`,
        text: theme.colors.secondary.DEFAULT,
        hover: `${theme.colors.secondary.DEFAULT}25`,
      },
      subtle: {
        bg: `${theme.colors.secondary.DEFAULT}08`,
        text: theme.colors.secondary.DEFAULT,
        hover: `${theme.colors.secondary.DEFAULT}15`,
      },
      dot: theme.colors.secondary.DEFAULT,
    },
    success: {
      solid: {
        bg: theme.colors.status.success,
        text: theme.colors.text.inverse,
        hover: `${theme.colors.status.success}cc`,
      },
      outline: {
        border: theme.colors.status.success,
        text: theme.colors.status.success,
        bg: "transparent",
        hover: `${theme.colors.status.success}10`,
      },
      soft: {
        bg: `${theme.colors.status.success}15`,
        text: theme.colors.status.success,
        hover: `${theme.colors.status.success}25`,
      },
      subtle: {
        bg: `${theme.colors.status.success}08`,
        text: theme.colors.status.success,
        hover: `${theme.colors.status.success}15`,
      },
      dot: theme.colors.status.success,
    },
    danger: {
      solid: {
        bg: theme.colors.status.error,
        text: theme.colors.text.inverse,
        hover: `${theme.colors.status.error}cc`,
      },
      outline: {
        border: theme.colors.status.error,
        text: theme.colors.status.error,
        bg: "transparent",
        hover: `${theme.colors.status.error}10`,
      },
      soft: {
        bg: `${theme.colors.status.error}15`,
        text: theme.colors.status.error,
        hover: `${theme.colors.status.error}25`,
      },
      subtle: {
        bg: `${theme.colors.status.error}08`,
        text: theme.colors.status.error,
        hover: `${theme.colors.status.error}15`,
      },
      dot: theme.colors.status.error,
    },
    warning: {
      solid: {
        bg: theme.colors.status.warning,
        text: theme.colors.text.inverse,
        hover: `${theme.colors.status.warning}cc`,
      },
      outline: {
        border: theme.colors.status.warning,
        text: theme.colors.status.warning,
        bg: "transparent",
        hover: `${theme.colors.status.warning}10`,
      },
      soft: {
        bg: `${theme.colors.status.warning}15`,
        text: theme.colors.status.warning,
        hover: `${theme.colors.status.warning}25`,
      },
      subtle: {
        bg: `${theme.colors.status.warning}08`,
        text: theme.colors.status.warning,
        hover: `${theme.colors.status.warning}15`,
      },
      dot: theme.colors.status.warning,
    },
    info: {
      solid: {
        bg: theme.colors.status.info,
        text: theme.colors.text.inverse,
        hover: `${theme.colors.status.info}cc`,
      },
      outline: {
        border: theme.colors.status.info,
        text: theme.colors.status.info,
        bg: "transparent",
        hover: `${theme.colors.status.info}10`,
      },
      soft: {
        bg: `${theme.colors.status.info}15`,
        text: theme.colors.status.info,
        hover: `${theme.colors.status.info}25`,
      },
      subtle: {
        bg: `${theme.colors.status.info}08`,
        text: theme.colors.status.info,
        hover: `${theme.colors.status.info}15`,
      },
      dot: theme.colors.status.info,
    },
    neutral: {
      solid: {
        bg: theme.colors.neutral[700],
        text: theme.colors.text.inverse,
        hover: theme.colors.neutral[800],
      },
      outline: {
        border: theme.colors.neutral[500],
        text: theme.colors.text.secondary,
        bg: "transparent",
        hover: theme.colors.background.surface,
      },
      soft: {
        bg: theme.colors.background.surface,
        text: theme.colors.text.primary,
        hover: theme.colors.background.surfaceHover,
      },
      subtle: {
        bg: `${theme.colors.neutral[500]}08`,
        text: theme.colors.text.secondary,
        hover: `${theme.colors.neutral[500]}15`,
      },
      dot: theme.colors.neutral[500],
    },
  };

  const getVariantStyles = (): React.CSSProperties => {
    if (variant === "dot") {
      return {};
    }
    const config = colorConfig[color][variant];
    if (variant === "solid") {
      return {
        background: config.bg,
        color: config.text,
      };
    }
    if (variant === "outline") {
      return {
        border: `2px solid `,
        color: config.text,
        background: config.bg,
      };
    }
    if (variant === "soft" || variant === "subtle") {
      return {
        background: config.bg,
        color: config.text,
      };
    }
    return {};
  };

  const getHoverStyles = (): React.CSSProperties => {
    if (variant === "dot") return {};
    const config = colorConfig[color][variant];
    if (variant === "solid") {
      return { background: config.hover };
    }
    if (variant === "outline") {
      return { background: config.hover };
    }
    if (variant === "soft" || variant === "subtle") {
      return { background: config.hover };
    }
    return {};
  };

  const dotStyles =
    dot || variant === "dot"
      ? `before:content-[''] before:inline-block before:w-2 before:h-2 before:rounded-full before:mr-1.5 ${
          variant === "dot" ? "" : ""
        }`
      : "";

  const pulseStyles = pulse ? "animate-pulse" : "";

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  if (variant === "dot") {
    return (
      <span className="inline-flex items-center">
        <span
          className={`w-2.5 h-2.5 rounded-full ${pulseStyles}`}
          style={{ background: colorConfig[color].dot }}
        />
        {children && (
          <span
            className="ml-1.5 text-sm"
            style={{ color: theme.colors.text.secondary }}
          >
            {children}
          </span>
        )}
      </span>
    );
  }

  const variantStyles = getVariantStyles();
  const hoverStyles = getHoverStyles();

  return (
    <span
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${pillStyles}
        ${dotStyles}
        ${pulseStyles}
        ${className}
      `}
      style={variantStyles}
      onMouseEnter={(e) => {
        if (!removable) {
          Object.assign(e.currentTarget.style, hoverStyles);
        }
      }}
      onMouseLeave={(e) => {
        if (!removable) {
          Object.assign(e.currentTarget.style, variantStyles);
        }
      }}
    >
      {icon && iconPosition === "left" && (
        <span className="inline-flex">{icon}</span>
      )}
      {children}
      {icon && iconPosition === "right" && (
        <span className="inline-flex">{icon}</span>
      )}
      {removable && (
        <button
          onClick={handleRemove}
          className="ml-1 rounded-full p-0.5 transition-colors hover:bg-black/10"
          aria-label="Remove"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

export default CustomBadge;
