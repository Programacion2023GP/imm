import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { theme as defaultTheme, type Theme } from "../../../config/themes";

type Tab = {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
  badge?: number | string;
};

type TabsProps = {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: "modern" | "minimal" | "cards" | "rounded";
  size?: "sm" | "md" | "lg";
  className?: string;
  contentClassName?: string;
  fullWidth?: boolean;
  theme?: Theme;
};

// Estilos dinámicos basados en tema
const getTabStyles = (
  theme: Theme,
  variant: TabsProps["variant"],
  isActive: boolean,
  disabled?: boolean,
) => {
  const baseStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 500,
    transition: theme.transitions.DEFAULT,
    whiteSpace: "nowrap",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    position: "relative",
  };

  const variantStyles = getVariantStyles(theme, variant);

  return {
    ...baseStyles,
    ...(isActive ? variantStyles.active : variantStyles.inactive),
  };
};

const getVariantStyles = (theme: Theme, variant: TabsProps["variant"]) => {
  const { colors, radius, shadows } = theme;

  switch (variant) {
    case "modern":
      return {
        active: {
          color: colors.primary.DEFAULT,
          borderBottom: `3px solid ${colors.primary.DEFAULT}`,
          backgroundColor: `rgba(${parseInt(colors.primary.DEFAULT.slice(1, 3), 16)}, ${parseInt(
            colors.primary.DEFAULT.slice(3, 5),
            16,
          )}, ${parseInt(colors.primary.DEFAULT.slice(5, 7), 16)}, 0.08)`,
          marginBottom: "-1px",
        },
        inactive: {
          color: colors.text.secondary,
          borderBottom: "2px solid transparent",
        },
      };
    case "minimal":
      return {
        active: {
          background: `linear-gradient(135deg, ${colors.primary[700]}, ${colors.primary[600]})`,
          color: colors.text.inverse,
          boxShadow: shadows.md,
          borderRadius: radius.lg,
        },
        inactive: {
          color: colors.text.secondary,
        },
      };
    case "cards":
      return {
        active: {
          background: colors.background.card,
          color: colors.text.primary,
          boxShadow: shadows.card,
          border: `2px solid ${colors.primary[200]}`,
          borderRadius: radius.xl,
        },
        inactive: {
          color: colors.text.secondary,
        },
      };
    case "rounded":
      return {
        active: {
          background: `linear-gradient(135deg, ${colors.background.card}, ${colors.neutral[50]})`,
          color: colors.text.primary,
          boxShadow: shadows.md,
          border: `1px solid ${colors.border.light}`,
          borderRadius: radius.full,
        },
        inactive: {
          color: colors.text.secondary,
        },
      };
    default:
      return { active: {}, inactive: {} };
  }
};

const getContainerStyles = (theme: Theme, variant: TabsProps["variant"]) => {
  const { colors, radius, shadows } = theme;

  switch (variant) {
    case "modern":
      return {
        borderBottom: `2px solid ${colors.border.light}`,
        background: `linear-gradient(to bottom, ${colors.background.card}, ${colors.background.surface})`,
      };
    case "minimal":
      return {
        background: colors.background.surface,
        borderRadius: radius.xl,
        padding: theme.spacing[1],
        backdropFilter: "blur(4px)",
        display: "flex",
        gap: theme.spacing[1],
      };
    case "cards":
      return {
        background: `linear-gradient(135deg, ${colors.neutral[100]}, ${colors.background.surface})`,
        borderRadius: radius["2xl"],
        padding: theme.spacing[2],
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
        marginBottom: theme.spacing[4],
      };
    case "rounded":
      return {
        background: `linear-gradient(to right, ${colors.neutral[200]}, ${colors.neutral[100]})`,
        borderRadius: radius.full,
        padding: theme.spacing[1.5],
        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
        marginBottom: theme.spacing[6],
      };
    default:
      return {};
  }
};

const getContentStyles = (theme: Theme, variant: TabsProps["variant"]) => {
  const { colors, radius, shadows } = theme;

  switch (variant) {
    case "modern":
      return {
        paddingTop: theme.spacing[4],
        background: colors.background.card,
      };
    case "minimal":
      return {
        padding: `0 ${theme.spacing[2]}`,
        background: "transparent",
      };
    case "cards":
      return {
        background: `linear-gradient(135deg, ${colors.background.card}, ${colors.feedback.primaryLight})`,
        border: `1px solid ${colors.border.light}`,
        borderRadius: radius.xl,
        padding: theme.spacing[6],
        boxShadow: shadows.sm,
      };
    case "rounded":
      return {
        background: `linear-gradient(135deg, ${colors.background.card}, rgba(255,255,255,0.9))`,
        borderRadius: radius["2xl"],
        border: `1px solid ${colors.border.light}`,
        boxShadow: shadows.sm,
        padding: theme.spacing[6],
      };
    default:
      return {};
  }
};

 function CustomTab({
   tabs,
   defaultTab,
   activeTab: externalActiveTab,
   onTabChange,
   variant = "modern",
   size = "md",
   className = "",
   contentClassName = "",
   fullWidth = false,
   theme = defaultTheme, // ✅ Usar el objeto importado, no el tipo
 }: TabsProps) {
   if (tabs.length === 1) {
     return <div className={className}>{tabs[0].content}</div>;
   }

   const [internalActiveTab, setInternalActiveTab] = useState(
     defaultTab ?? tabs[0]?.id,
   );
   const activeTab =
     externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;

   const sizeClasses = {
     sm: {
       tab: {
         padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
         fontSize: theme.typography.fontSize.xs,
       },
       icon: { width: "0.75rem", height: "0.75rem" },
       badge: { fontSize: "10px", padding: "0.125rem 0.375rem" },
     },
     md: {
       tab: {
         padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
         fontSize: theme.typography.fontSize.sm,
       },
       icon: { width: "1rem", height: "1rem" },
       badge: {
         fontSize: theme.typography.fontSize.xs,
         padding: "0.125rem 0.5rem",
       },
     },
     lg: {
       tab: {
         padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
         fontSize: theme.typography.fontSize.base,
       },
       icon: { width: "1.25rem", height: "1.25rem" },
       badge: {
         fontSize: theme.typography.fontSize.sm,
         padding: "0.125rem 0.625rem",
       },
     },
   };

   const currentSize = sizeClasses[size];
   const containerStyles = getContainerStyles(theme, variant);
   const contentStyles = getContentStyles(theme, variant);

   const handleTabChange = (tabId: string) => {
     if (externalActiveTab === undefined) {
       setInternalActiveTab(tabId);
     }
     onTabChange?.(tabId);
   };

   const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

   return (
     <div
       className={`w-full ${className}`}
       style={{ fontFamily: theme.typography.fontFamilyPrimary }}
     >
       <div
         className={`flex ${fullWidth ? "w-full" : "w-auto"}`}
         style={containerStyles}
       >
         {tabs.map((tab) => {
           const isActive = activeTab === tab.id;
           const tabStyles = getTabStyles(
             theme,
             variant,
             isActive,
             tab.disabled,
           );

           return (
             <button
               key={tab.id}
               onClick={() => !tab.disabled && handleTabChange(tab.id)}
               disabled={tab.disabled}
               className={fullWidth ? "flex-1" : ""}
               style={{
                 ...tabStyles,
                 ...currentSize.tab,
                 borderRadius:
                   variant === "rounded"
                     ? theme.radius.full
                     : variant === "cards"
                       ? theme.radius.xl
                       : theme.radius.md,
               }}
               role="tab"
               aria-selected={isActive}
               onMouseEnter={(e) => {
                 if (!isActive && !tab.disabled) {
                   const target = e.currentTarget;
                   if (variant === "minimal") {
                     target.style.backgroundColor = "rgba(255,255,255,0.8)";
                     target.style.color = theme.colors.text.primary;
                   } else if (variant === "cards") {
                     target.style.backgroundColor = "rgba(255,255,255,0.7)";
                     target.style.boxShadow = theme.shadows.sm;
                   } else if (variant === "rounded") {
                     target.style.backgroundColor = "rgba(255,255,255,0.6)";
                   } else {
                     target.style.backgroundColor =
                       theme.colors.background.surfaceHover;
                     target.style.color = theme.colors.text.primary;
                   }
                 }
               }}
               onMouseLeave={(e) => {
                 if (!isActive && !tab.disabled) {
                   const target = e.currentTarget;
                   if (variant === "minimal") {
                     target.style.backgroundColor = "";
                     target.style.color = theme.colors.text.secondary;
                   } else if (variant === "cards") {
                     target.style.backgroundColor = "";
                     target.style.boxShadow = "";
                   } else if (variant === "rounded") {
                     target.style.backgroundColor = "";
                   } else {
                     target.style.backgroundColor = "";
                     target.style.color = theme.colors.text.secondary;
                   }
                 }
               }}
             >
               {tab.icon && (
                 <span
                   style={{
                     ...currentSize.icon,
                     marginRight: theme.spacing[2],
                   }}
                   className="flex items-center justify-center"
                 >
                   {tab.icon}
                 </span>
               )}
               <span className="font-medium tracking-tight">{tab.label}</span>
               {tab.badge !== undefined && tab.badge !== "" && (
                 <span
                   style={{
                     marginLeft: theme.spacing[2],
                     ...currentSize.badge,
                     borderRadius: theme.radius.full,
                     fontWeight: 500,
                     lineHeight: 1,
                     backgroundColor: isActive
                       ? variant === "minimal"
                         ? "rgba(255,255,255,0.2)"
                         : theme.colors.primary[100]
                       : theme.colors.neutral[200],
                     color: isActive
                       ? variant === "minimal"
                         ? theme.colors.text.inverse
                         : theme.colors.primary[700]
                       : theme.colors.text.secondary,
                   }}
                 >
                   {tab.badge}
                 </span>
               )}
             </button>
           );
         })}
       </div>

       <AnimatePresence mode="wait">
         <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 8 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -8 }}
           transition={{
             type: "spring",
             stiffness: 300,
             damping: 30,
             mass: 0.5,
           }}
           className={contentClassName}
           style={contentStyles}
         >
           {activeTabContent}
         </motion.div>
       </AnimatePresence>
     </div>
   );
 }
export default CustomTab;