// CompositeCrud/utils/responsive.ts
import type { ResponsiveSizes } from "../types";

// ─── Responsive Sizes (re-export desde types) ─────────────────────────────────
export type { ResponsiveSizes };

// ─── Default Responsive Values ────────────────────────────────────────────────
export const DEFAULT_RESPONSIVE: ResponsiveSizes = {
  sm: 12,
  md: 12,
  lg: 12,
  xl: 12,
  "2xl": 12,
};

// ─── Utilidad para combinar responsive sizes ─────────────────────────────────
export const combineResponsive = (
  base: ResponsiveSizes,
  override?: ResponsiveSizes,
): ResponsiveSizes => ({
  sm: override?.sm ?? base.sm,
  md: override?.md ?? base.md,
  lg: override?.lg ?? base.lg,
  xl: override?.xl ?? base.xl,
  "2xl": override?.["2xl"] ?? base["2xl"],
});

// ─── Utilidad para obtener clase CSS grid responsiva ──────────────────────────
export const getResponsiveGridClass = (responsive: ResponsiveSizes): string => {
  const classes: string[] = [];

  if (responsive.sm) classes.push(`col-span-${responsive.sm}`);
  if (responsive.md) classes.push(`md:col-span-${responsive.md}`);
  if (responsive.lg) classes.push(`lg:col-span-${responsive.lg}`);
  if (responsive.xl) classes.push(`xl:col-span-${responsive.xl}`);
  if (responsive["2xl"]) classes.push(`2xl:col-span-${responsive["2xl"]}`);

  return classes.join(" ");
};

// ─── Utilidad para obtener estilos inline responsivos ─────────────────────────
export const getResponsiveGridStyle = (
  responsive: ResponsiveSizes,
): React.CSSProperties => ({
  gridColumn: `span ${responsive.sm || 12}`,
  ...(responsive.md && {
    "@media (min-width: 768px)": { gridColumn: `span ${responsive.md}` },
  }),
  ...(responsive.lg && {
    "@media (min-width: 1024px)": { gridColumn: `span ${responsive.lg}` },
  }),
  ...(responsive.xl && {
    "@media (min-width: 1280px)": { gridColumn: `span ${responsive.xl}` },
  }),
  ...(responsive["2xl"] && {
    "@media (min-width: 1536px)": { gridColumn: `span ${responsive["2xl"]}` },
  }),
});
