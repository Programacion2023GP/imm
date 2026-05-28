import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import { theme } from "../../../../config/themes";

type ButtonPropsMovil = {
  onClick?: () => void;
  children?: React.ReactNode;
  variant?: "filled" | "outlined" | "text" | "elevated" | "tonal" | "icon";
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "surface";
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right" | "only";
  className?: string;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
};

export const CustomButtonMovil: React.FC<ButtonPropsMovil> = ({
  onClick,
  children,
  type = "button",
  variant = "filled",
  color = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = "left",
  elevation = 1,
  className = "",
}) => {
  // Sistema de tamaños Flutter auténtico
  const sizeClasses = {
    sm: "h-9 px-4 text-sm rounded-[20px] min-w-[64px]",
    md: "h-12 px-6 text-base rounded-[28px] min-w-[88px]",
    lg: "h-14 px-8 text-lg rounded-[32px] min-w-[96px]",
  }[size];

  // Sistema de elevación Flutter (shadows)
  const elevationShadows = {
    0: "shadow-none",
    1: "shadow-sm",
    2: "shadow",
    3: "shadow-md",
    4: "shadow-lg",
    5: "shadow-xl",
    6: "shadow-xl",
    7: "shadow-2xl",
    8: "shadow-2xl",
  }[elevation];

  // Colores Material Design 3 usando el tema global
  const colorSchemes = {
    primary: {
      filled: `bg-[${theme.colors.primary.DEFAULT}] text-white shadow-sm hover:bg-[${theme.colors.primary.dark}] active:bg-[${theme.colors.primary.dark}cc]`,
      outlined: `border border-[${theme.colors.primary.DEFAULT}] text-[${theme.colors.primary.DEFAULT}] bg-transparent hover:bg-[${theme.colors.primary.DEFAULT}]/10 active:bg-[${theme.colors.primary.DEFAULT}]/20`,
      text: `text-[${theme.colors.primary.DEFAULT}] bg-transparent hover:bg-[${theme.colors.primary.DEFAULT}]/10 active:bg-[${theme.colors.primary.DEFAULT}]/20`,
      elevated: `bg-white text-[${theme.colors.primary.DEFAULT}] shadow-sm hover:bg-[${theme.colors.primary.DEFAULT}]/10 active:bg-[${theme.colors.primary.DEFAULT}]/20`,
      tonal: `bg-[${theme.colors.primary.DEFAULT}]/15 text-[${theme.colors.primary.DEFAULT}] hover:bg-[${theme.colors.primary.DEFAULT}]/25 active:bg-[${theme.colors.primary.DEFAULT}]/35`,
      icon: `text-[${theme.colors.primary.DEFAULT}] bg-transparent hover:bg-[${theme.colors.primary.DEFAULT}]/10 active:bg-[${theme.colors.primary.DEFAULT}]/20`,
    },
    secondary: {
      filled: `bg-[${theme.colors.secondary.DEFAULT}] text-white shadow-sm hover:bg-[${theme.colors.secondary.dark}] active:bg-[${theme.colors.secondary.dark}cc]`,
      outlined: `border border-[${theme.colors.secondary.DEFAULT}] text-[${theme.colors.secondary.DEFAULT}] bg-transparent hover:bg-[${theme.colors.secondary.DEFAULT}]/10 active:bg-[${theme.colors.secondary.DEFAULT}]/20`,
      text: `text-[${theme.colors.secondary.DEFAULT}] bg-transparent hover:bg-[${theme.colors.secondary.DEFAULT}]/10 active:bg-[${theme.colors.secondary.DEFAULT}]/20`,
      elevated: `bg-white text-[${theme.colors.secondary.DEFAULT}] shadow-sm hover:bg-[${theme.colors.secondary.DEFAULT}]/10 active:bg-[${theme.colors.secondary.DEFAULT}]/20`,
      tonal: `bg-[${theme.colors.secondary.DEFAULT}]/15 text-[${theme.colors.secondary.DEFAULT}] hover:bg-[${theme.colors.secondary.DEFAULT}]/25 active:bg-[${theme.colors.secondary.DEFAULT}]/35`,
      icon: `text-[${theme.colors.secondary.DEFAULT}] bg-transparent hover:bg-[${theme.colors.secondary.DEFAULT}]/10 active:bg-[${theme.colors.secondary.DEFAULT}]/20`,
    },
    success: {
      filled: `bg-[${theme.colors.status.success}] text-white shadow-sm hover:bg-[${theme.colors.status.success}cc] active:bg-[${theme.colors.status.success}99]`,
      outlined: `border border-[${theme.colors.status.success}] text-[${theme.colors.status.success}] bg-transparent hover:bg-[${theme.colors.status.success}]/10 active:bg-[${theme.colors.status.success}]/20`,
      text: `text-[${theme.colors.status.success}] bg-transparent hover:bg-[${theme.colors.status.success}]/10 active:bg-[${theme.colors.status.success}]/20`,
      elevated: `bg-white text-[${theme.colors.status.success}] shadow-sm hover:bg-[${theme.colors.status.success}]/10 active:bg-[${theme.colors.status.success}]/20`,
      tonal: `bg-[${theme.colors.status.success}]/15 text-[${theme.colors.status.success}] hover:bg-[${theme.colors.status.success}]/25 active:bg-[${theme.colors.status.success}]/35`,
      icon: `text-[${theme.colors.status.success}] bg-transparent hover:bg-[${theme.colors.status.success}]/10 active:bg-[${theme.colors.status.success}]/20`,
    },
    warning: {
      filled: `bg-[${theme.colors.status.warning}] text-white shadow-sm hover:bg-[${theme.colors.status.warning}cc] active:bg-[${theme.colors.status.warning}99]`,
      outlined: `border border-[${theme.colors.status.warning}] text-[${theme.colors.status.warning}] bg-transparent hover:bg-[${theme.colors.status.warning}]/10 active:bg-[${theme.colors.status.warning}]/20`,
      text: `text-[${theme.colors.status.warning}] bg-transparent hover:bg-[${theme.colors.status.warning}]/10 active:bg-[${theme.colors.status.warning}]/20`,
      elevated: `bg-white text-[${theme.colors.status.warning}] shadow-sm hover:bg-[${theme.colors.status.warning}]/10 active:bg-[${theme.colors.status.warning}]/20`,
      tonal: `bg-[${theme.colors.status.warning}]/15 text-[${theme.colors.status.warning}] hover:bg-[${theme.colors.status.warning}]/25 active:bg-[${theme.colors.status.warning}]/35`,
      icon: `text-[${theme.colors.status.warning}] bg-transparent hover:bg-[${theme.colors.status.warning}]/10 active:bg-[${theme.colors.status.warning}]/20`,
    },
    error: {
      filled: `bg-[${theme.colors.status.error}] text-white shadow-sm hover:bg-[${theme.colors.status.error}cc] active:bg-[${theme.colors.status.error}99]`,
      outlined: `border border-[${theme.colors.status.error}] text-[${theme.colors.status.error}] bg-transparent hover:bg-[${theme.colors.status.error}]/10 active:bg-[${theme.colors.status.error}]/20`,
      text: `text-[${theme.colors.status.error}] bg-transparent hover:bg-[${theme.colors.status.error}]/10 active:bg-[${theme.colors.status.error}]/20`,
      elevated: `bg-white text-[${theme.colors.status.error}] shadow-sm hover:bg-[${theme.colors.status.error}]/10 active:bg-[${theme.colors.status.error}]/20`,
      tonal: `bg-[${theme.colors.status.error}]/15 text-[${theme.colors.status.error}] hover:bg-[${theme.colors.status.error}]/25 active:bg-[${theme.colors.status.error}]/35`,
      icon: `text-[${theme.colors.status.error}] bg-transparent hover:bg-[${theme.colors.status.error}]/10 active:bg-[${theme.colors.status.error}]/20`,
    },
    surface: {
      filled: `bg-[${theme.colors.background.surface}] text-[${theme.colors.text.primary}] shadow-sm hover:bg-[${theme.colors.background.surfaceHover}] active:bg-[${theme.colors.background.surfaceHover}cc]`,
      outlined: `border border-[${theme.colors.border.DEFAULT}] text-[${theme.colors.text.secondary}] bg-transparent hover:bg-[${theme.colors.background.surface}] active:bg-[${theme.colors.background.surfaceHover}]`,
      text: `text-[${theme.colors.text.secondary}] bg-transparent hover:bg-[${theme.colors.background.surface}] active:bg-[${theme.colors.background.surfaceHover}]`,
      elevated: `bg-white text-[${theme.colors.text.secondary}] shadow-sm hover:bg-[${theme.colors.background.surface}] active:bg-[${theme.colors.background.surfaceHover}]`,
      tonal: `bg-[${theme.colors.background.surface}] text-[${theme.colors.text.primary}] hover:bg-[${theme.colors.background.surfaceHover}] active:bg-[${theme.colors.background.surfaceHover}cc]`,
      icon: `text-[${theme.colors.text.secondary}] bg-transparent hover:bg-[${theme.colors.background.surface}] active:bg-[${theme.colors.background.surfaceHover}]`,
    },
  };

  const isIconOnly = iconPosition === "only" || (!children && icon);

  const iconSizeClasses = {
    sm: "w-9 h-9 rounded-full min-w-9",
    md: "w-12 h-12 rounded-full min-w-12",
    lg: "w-14 h-14 rounded-full min-w-14",
  }[size];

  // Ripple effect como Flutter
  const [ripple, setRipple] = React.useState<{
    x: number;
    y: number;
    size: number;
  } | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    setRipple({ x, y, size });
    setTimeout(() => setRipple(null), 600);
    onClick?.();
  };

  // Spinner de carga Flutter-style
  const LoadingSpinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="flex items-center justify-center"
    >
      <div
        className={`rounded-full border-2 border-current border-t-transparent ${
          size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-6 h-6"
        }`}
      />
    </motion.div>
  );

  const currentScheme = colorSchemes[color];
  const variantClass = currentScheme[variant];
  const hasElevation = ["filled", "elevated"].includes(variant);

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      whileTap={{
        scale: disabled || loading ? 1 : 0.98,
        transition: { duration: 0.1 },
      }}
      whileHover={
        !disabled && !loading
          ? {
              y: -1,
              transition: { duration: 0.2 },
            }
          : {}
      }
      className={`
        relative
        inline-flex items-center justify-center
        font-medium transition-all duration-200
        overflow-hidden
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-40 disabled:cursor-not-allowed
        active:brightness-95
        ${fullWidth ? "w-full" : ""}
        ${isIconOnly ? iconSizeClasses : sizeClasses}
        ${variantClass}
        ${hasElevation ? elevationShadows : ""}
        ${variant === "outlined" || variant === "text" || variant === "icon" ? "border" : ""}
        lg:hidden
        ${className}
      `}
      style={{
        fontFamily: "'Roboto', 'Segoe UI', system-ui, sans-serif",
        letterSpacing: "0.25px",
      }}
    >
      {/* Ripple Effect como Flutter */}
      <AnimatePresence>
        {ripple && (
          <motion.span
            initial={{ scale: 0, opacity: 0.3 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute rounded-full bg-white"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
          />
        )}
      </AnimatePresence>

      {/* Estado de carga */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2"
        >
          <LoadingSpinner />
          {children && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              Cargando...
            </motion.span>
          )}
        </motion.div>
      ) : (
        <motion.div className="flex items-center justify-center gap-2" layout>
          {icon && iconPosition !== "right" && !isIconOnly && (
            <motion.span
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className={`flex-shrink-0 ${
                children ? (iconPosition === "left" ? "mr-2" : "ml-2") : ""
              }`}
            >
              {icon}
            </motion.span>
          )}

          {children && (
            <motion.span layout className="relative whitespace-nowrap">
              {children}
            </motion.span>
          )}

          {icon && iconPosition === "right" && !isIconOnly && (
            <motion.span
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="flex-shrink-0 ml-2"
            >
              {icon}
            </motion.span>
          )}

          {isIconOnly && (
            <motion.span
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {icon}
            </motion.span>
          )}
        </motion.div>
      )}

      {/* Overlay de hover como Flutter */}
      {!disabled && !loading && (
        <motion.div
          className="absolute inset-0 bg-black opacity-0 hover:opacity-5 active:opacity-10"
          transition={{ duration: 0.15 }}
        />
      )}
    </motion.button>
  );
};

// Floating Action Button (FAB) como Flutter - Solo móvil
export const FloatingActionButton: React.FC<{
  onClick?: () => void;
  icon: React.ReactNode;
  color?: "primary" | "secondary" | "surface" | "tertiary";
  size?: "small" | "normal" | "large";
  extended?: boolean;
  label?: string;
  className?: string;
  position?: "bottom-right" | "bottom-left" | "bottom-center" | "inline";
}> = ({
  onClick,
  icon,
  color = "primary",
  size = "normal",
  extended = false,
  label,
  className = "",
  position = "bottom-right",
}) => {
  // Clases de tamaño
  const sizeClasses = {
    small: "w-12 h-12",
    normal: "w-16 h-16",
    large: "w-24 h-24",
  }[size];

  // Clases de color usando el tema global
  const colorClasses = {
    primary: `bg-[${theme.colors.primary.DEFAULT}] text-white hover:bg-[${theme.colors.primary.dark}] active:bg-[${theme.colors.primary.dark}cc]`,
    secondary: `bg-[${theme.colors.secondary.DEFAULT}] text-white hover:bg-[${theme.colors.secondary.dark}] active:bg-[${theme.colors.secondary.dark}cc]`,
    surface: `bg-white text-[${theme.colors.text.primary}] border border-[${theme.colors.border.DEFAULT}] hover:bg-[${theme.colors.background.surface}] active:bg-[${theme.colors.background.surfaceHover}]`,
    tertiary: `bg-[${theme.colors.background.surface}] text-[${theme.colors.text.primary}] hover:bg-[${theme.colors.background.surfaceHover}] active:bg-[${theme.colors.background.surfaceHover}cc]`,
  }[color];

  const positionClasses = {
    "bottom-right": "fixed bottom-6 right-6",
    "bottom-left": "fixed bottom-6 left-6",
    "bottom-center": "fixed bottom-6 left-1/2 transform -translate-x-1/2",
    inline: "relative",
  }[position];

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05, y: -2 }}
      className={`
        ${positionClasses}
        ${extended ? "px-6 h-14 rounded-[28px]" : `${sizeClasses} rounded-full`}
        ${colorClasses}
        flex items-center justify-center
        font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        active:brightness-95
        shadow-lg
        z-40
        lg:hidden
        ${className}
      `}
      style={{
        paddingBottom:
          position !== "inline" ? "env(safe-area-inset-bottom, 0)" : "0",
      }}
    >
      {extended && label ? (
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-sm font-medium whitespace-nowrap">{label}</span>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          {icon}
        </div>
      )}
    </motion.button>
  );
};

// Componente adicional para grupos de botones - Solo móvil
export const ButtonGroup: React.FC<{
  children: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  className?: string;
}> = ({ children, orientation = "horizontal", className = "" }) => {
  return (
    <div
      className={`
        flex ${orientation === "horizontal" ? "flex-row space-x-2" : "flex-col space-y-2"}
        lg:hidden
        ${className}
      `}
    >
      {children}
    </div>
  );
};
