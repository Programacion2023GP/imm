// src/styles/theme-essential.ts
// 🩺 TEMA: GUINDA ESENCIAL - Elegancia clínica con guinda principal

// --------------------------------------------------------------
// 1. PALETAS BASE (con grises personalizados)
// --------------------------------------------------------------
const neutralPalette = {
  50: "#F8F9FA",
  100: "#F1F3F5",
  200: "#E9ECEF",
  300: "#DEE2E6",
  400: "#CED4DA",
  500: "#B8B6AF", // Gris claro
  600: "#727372", // Gris
  700: "#474C55", // Gris cool
  800: "#343A40",
  900: "#130D0E", // Negro
  DEFAULT: "#727372",
};

const textPalette = {
  primary: "#212529",
  secondary: "#6C757D",
  placeholder: "#ADB5BD",
  disabled: "#CED4DA",
  inverse: "#FFFFFF",
};

const backgroundPalette = {
  page: "#F8F9FA",
  card: "#FFFFFF",
  surface: "#F1F3F5",
  surfaceHover: "#E9ECEF",
};

const borderPalette = {
  light: "#E9ECEF",
  DEFAULT: "#DEE2E6",
  hover: "#CED4DA",
  focus: "#9B2242",
  error: "#DC3545",
};

const statusPalette = {
  success: "#198754",
  warning: "#FFC107",
  error: "#DC3545",
  info: "#0D6EFD",
  critical: "#DC3545",
  stable: "#198754",
};


// --------------------------------------------------------------
// 2. TEMA BASE
// --------------------------------------------------------------
export const baseTheme = {
  colors: {
    primary: {
      50: "",
      100: "",
      200: "",
      300: "",
      400: "",
      500: "",
      600: "",
      700: "",
      800: "",
      900: "",
      DEFAULT: "",
      light: "",
      dark: "",
    },
    secondary: {
      50: "",
      100: "",
      200: "",
      300: "",
      400: "",
      500: "",
      600: "",
      700: "",
      800: "",
      900: "",
      DEFAULT: "",
      light: "",
      dark: "",
    },
    neutral: neutralPalette,
    background: backgroundPalette,
    text: textPalette,
    border: borderPalette,
    status: statusPalette,
    feedback: {
      primaryLight: "",
      primaryMid: "",
      primaryGlow: "",
      errorLight: "#FEF2F2",
      errorBorder: "#FCA5A5",
      errorGlow: "0 0 0 3px rgba(220,38,38,0.10)",
      successLight: "#F0FDF4",
      warningLight: "#FEFCE8",
      infoLight: "#EFF6FF",
    },
  },
  radius: {
    none: "0",
    sm: "6px",
    md: "10px",
    lg: "14px",
    xl: "18px",
    "2xl": "24px",
    full: "9999px",
    pill: "100px",
  },
  shadows: {
    none: "none",
    sm: "0 1px 3px rgba(0,0,0,0.05)",
    md: "0 4px 8px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.02)",
    lg: "0 8px 16px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.02)",
    xl: "0 16px 24px rgba(0,0,0,0.06), 0 8px 12px rgba(0,0,0,0.03)",
    dropdown: "0 12px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)",
    focus: "",
    card: "0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
  },
  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    normal: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
    DEFAULT: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
  },
  spacing: {
    0: "0px",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
  },
  zIndex: {
    dropdown: 1000,
    modal: 1100,
    tooltip: 1200,
    toast: 1300,
    portal: 99999,
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
  typography: {
    fontFamilyPrimary: "Avenir, 'Segoe UI', system-ui, sans-serif",
    fontFamilySecondary: "'Zapf Humanist 601 BT', Georgia, serif",
    fontFamily: "Avenir, 'Segoe UI', system-ui, sans-serif",
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
    fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },
  dark: {
    colors: {
      background: {
        page: "#1a1f2e",
        card: "#252a3a",
        surface: "#2d3346",
        surfaceHover: "#353c52",
      },
      text: {
        primary: "#E5E7EB",
        secondary: "#9CA3AF",
        placeholder: "#6B7280",
        disabled: "#4B5563",
        inverse: "#1a1f2e",
      },
      border: {
        light: "#374151",
        DEFAULT: "#4B5563",
        hover: "#6B7280",
        focus: "#60A5FA",
        error: "#F87171",
      },
    },
  },
};

// --------------------------------------------------------------
// 3. FUNCIÓN CREAR TEMA
// --------------------------------------------------------------
export function createTheme(primaryPalette: any, name: string = "custom") {
  const r = parseInt(primaryPalette.DEFAULT.slice(1, 3), 16);
  const g = parseInt(primaryPalette.DEFAULT.slice(3, 5), 16);
  const b = parseInt(primaryPalette.DEFAULT.slice(5, 7), 16);
  const feedbackLight = `rgba(${r},${g},${b},0.08)`;
  const feedbackMid = `rgba(${r},${g},${b},0.16)`;
  const focusShadow = `0 0 0 3px rgba(${r},${g},${b},0.25)`;
  return {
    ...baseTheme,
    name,
    colors: {
      ...baseTheme.colors,
      primary: primaryPalette,
      secondary: {
        ...baseTheme.colors.secondary,
        DEFAULT: primaryPalette[600] || primaryPalette.DEFAULT,
        light: primaryPalette[400] || primaryPalette.light,
        dark: primaryPalette[700] || primaryPalette.dark,
      },
      feedback: {
        ...baseTheme.colors.feedback,
        primaryLight: feedbackLight,
        primaryMid: feedbackMid,
        primaryGlow: focusShadow,
      },
    },
    shadows: { ...baseTheme.shadows, focus: focusShadow },
  };
}

// --------------------------------------------------------------
// 4. PALETA GUINDA
// --------------------------------------------------------------
const burgundyPalette = {
  50: "#FDF2F5",
  100: "#F9E4EA",
  200: "#F0C2CF",
  300: "#E69BB2",
  400: "#D96E8E",
  500: "#C8456B",
  600: "#9B2242",
  700: "#7D1B35",
  800: "#651D32",
  900: "#4A1424",
  DEFAULT: "#9B2242",
  light: "#C8456B",
  dark: "#651D32",
};

// --------------------------------------------------------------
// 5. TEMA EXPORTADO
// --------------------------------------------------------------
export const theme = createTheme(burgundyPalette, "essential");
export type Theme = typeof theme;
