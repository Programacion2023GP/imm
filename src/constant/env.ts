// import { createTheme } from "@mui/material";

const env = {
   APP_KEY: "local", // Clave para WebSocket
   VERSION: __APP_VERSION__, //import.meta.env.VITE_VERSION,
   API_URL: import.meta.env.VITE_API_URL,
   API_URL_IMG: import.meta.env.VITE_API_URL_IMG,
   NAME_SYSTEM: "GP Central",
   // API_CP: import.meta.env.VITE_API_CP,
   // API_KEY_ORC: import.meta.env.VITE_API_KEY_ORC
   TRANSITION_TIME: "0.3s",
   // THEME: createTheme({
   //    cssVariables: {
   //       colorSchemeSelector: "data-color-scheme"
   //    },
   //    colorSchemes: {
   //       light: {
   //          palette: {
   //             // background: {
   //             //    default: "#eeeeee", //BG Main
   //             //    paper: "#f5f5f5" //Nav y Side
   //             // },
   //             // primary: {
   //             //    main: "#034AAB"
   //             // },
   //             background: {
   //                default: "#f8fafc",
   //                paper: "#ffffff",
   //                subtle: "#f1f5f9"
   //             },
   //             primary: {
   //                main: "#034AAB",
   //                light: "#3b82f6",
   //                dark: "#1e40af",
   //                contrastText: "#ffffff"
   //             },
   //             secondary: {
   //                main: "#7c3aed",
   //                light: "#8b5cf6",
   //                dark: "#6d28d9",
   //                contrastText: "#ffffff"
   //             },
   //             success: {
   //                main: "#059669",
   //                light: "#10b981",
   //                dark: "#047857",
   //                contrastText: "#ffffff"
   //             },
   //             warning: {
   //                main: "#d97706",
   //                light: "#f59e0b",
   //                dark: "#b45309",
   //                contrastText: "#ffffff"
   //             },
   //             error: {
   //                main: "#dc2626",
   //                light: "#ef4444",
   //                dark: "#b91c1c",
   //                contrastText: "#ffffff"
   //             },
   //             info: {
   //                main: "#0891b2",
   //                light: "#06b6d4",
   //                dark: "#0e7490",
   //                contrastText: "#ffffff"
   //             },
   //             text: {
   //                primary: "#1e293b",
   //                secondary: "#64748b",
   //                disabled: "#94a3b8"
   //             },
   //             grey: {
   //                50: "#f8fafc",
   //                100: "#f1f5f9",
   //                200: "#e2e8f0",
   //                300: "#cbd5e1",
   //                400: "#94a3b8",
   //                500: "#64748b",
   //                600: "#475569",
   //                700: "#334155",
   //                800: "#1e293b",
   //                900: "#0f172a"
   //             },
   //             divider: "#e2e8f0",
   //             action: {
   //                active: "#64748b",
   //                hover: "#f1f5f9",
   //                selected: "#e2e8f0",
   //                disabled: "#94a3b8",
   //                disabledBackground: "#f1f5f9"
   //             }
   //          },
   //          shape: {
   //             borderRadius: 12
   //          },
   //          shadows: [
   //             "none",
   //             "0 1px 2px 0 rgb(0 0 0 / 0.05)",
   //             "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
   //             "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
   //             "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
   //             "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
   //             "0 25px 50px -12px rgb(0 0 0 / 0.25)",
   //             ...Array(18).fill("none")
   //          ]
   //       },
   //       dark: {
   //          palette: {
   //             // background: {
   //             //    default: "#31363F", //"#424242", //BG Main
   //             //    paper: "#222831" //"#212121", //Nav y Side
   //             // },
   //             // primary: {
   //             //    main: "#1B2430"
   //             // }
   //             background: {
   //                default: "#0f172a",
   //                paper: "#1e293b",
   //                subtle: "#334155"
   //             },
   //             primary: {
   //                main: "#3b82f6",
   //                light: "#60a5fa",
   //                dark: "#2563eb",
   //                contrastText: "#ffffff"
   //             },
   //             secondary: {
   //                main: "#8b5cf6",
   //                light: "#a78bfa",
   //                dark: "#7c3aed",
   //                contrastText: "#ffffff"
   //             },
   //             success: {
   //                main: "#10b981",
   //                light: "#34d399",
   //                dark: "#059669",
   //                contrastText: "#ffffff"
   //             },
   //             warning: {
   //                main: "#f59e0b",
   //                light: "#fbbf24",
   //                dark: "#d97706",
   //                contrastText: "#1e293b"
   //             },
   //             error: {
   //                main: "#ef4444",
   //                light: "#f87171",
   //                dark: "#dc2626",
   //                contrastText: "#ffffff"
   //             },
   //             info: {
   //                main: "#06b6d4",
   //                light: "#22d3ee",
   //                dark: "#0891b2",
   //                contrastText: "#ffffff"
   //             },
   //             text: {
   //                primary: "#f1f5f9",
   //                secondary: "#cbd5e1",
   //                disabled: "#64748b"
   //             },
   //             grey: {
   //                50: "#f8fafc",
   //                100: "#f1f5f9",
   //                200: "#e2e8f0",
   //                300: "#cbd5e1",
   //                400: "#94a3b8",
   //                500: "#64748b",
   //                600: "#475569",
   //                700: "#334155",
   //                800: "#1e293b",
   //                900: "#0f172a"
   //             },
   //             divider: "#334155",
   //             action: {
   //                active: "#cbd5e1",
   //                hover: "#334155",
   //                selected: "#475569",
   //                disabled: "#475569",
   //                disabledBackground: "#334155"
   //             }
   //          },
   //          shape: {
   //             borderRadius: 12
   //          },
   //          shadows: [
   //             "none",
   //             "0 1px 2px 0 rgb(0 0 0 / 0.3)",
   //             "0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)",
   //             "0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)",
   //             "0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)",
   //             "0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)",
   //             "0 25px 50px -12px rgb(0 0 0 / 0.5)",
   //             ...Array(18).fill("none")
   //          ]
   //       }
   //    },

   //    typography: {
   //       fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
   //       h1: {
   //          fontSize: "2.5rem",
   //          fontWeight: 800,
   //          lineHeight: 1.2
   //       },
   //       h2: {
   //          fontSize: "2rem",
   //          fontWeight: 700,
   //          lineHeight: 1.3
   //       },
   //       h3: {
   //          fontSize: "1.75rem",
   //          fontWeight: 700,
   //          lineHeight: 1.4
   //       },
   //       h4: {
   //          fontSize: "1.5rem",
   //          fontWeight: 600,
   //          lineHeight: 1.4
   //       },
   //       h5: {
   //          fontSize: "1.25rem",
   //          fontWeight: 600,
   //          lineHeight: 1.5
   //       },
   //       h6: {
   //          fontSize: "1.125rem",
   //          fontWeight: 600,
   //          lineHeight: 1.6
   //       },
   //       body1: {
   //          fontSize: "1rem",
   //          lineHeight: 1.6
   //       },
   //       body2: {
   //          fontSize: "0.875rem",
   //          lineHeight: 1.5
   //       },
   //       caption: {
   //          fontSize: "0.75rem",
   //          lineHeight: 1.4
   //       }
   //    },

   //    breakpoints: {
   //       values: {
   //          xs: 0,
   //          sm: 640,
   //          md: 768,
   //          lg: 1024,
   //          xl: 1280
   //       }
   //    }

   //    // components: {
   //    //    MuiCard: {
   //    //       styleOverrides: {
   //    //          root: {
   //    //             boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
   //    //             border: "1px solid",
   //    //             borderColor: "var(--mui-palette-divider)"
   //    //          }
   //    //       }
   //    //    },
   //    //    MuiButton: {
   //    //       styleOverrides: {
   //    //          root: {
   //    //             textTransform: "none",
   //    //             fontWeight: 600,
   //    //             borderRadius: 8
   //    //          }
   //    //       }
   //    //    },
   //    //    MuiChip: {
   //    //       styleOverrides: {
   //    //          root: {
   //    //             fontWeight: 500
   //    //          }
   //    //       }
   //    //    }
   //    //    // MuiDataGridCell: {
   //    //    //    styleOverrides: {
   //    //    //       root: {
   //    //    //          fontWeight: 500
   //    //    //       }
   //    //    //    }
   //    //    // }
   //    // }
   //    //  transitions: {
   //    //     duration: {
   //    //        shortest: 1500,
   //    //        shorter: 2000,
   //    //        short: 2500,
   //    //        standard: 3000, // 300ms por defecto
   //    //        complex: 3750,
   //    //        enteringScreen: 2250,
   //    //        leavingScreen: 1950,
   //    //     },
   //    //  },
   // })
};
export default env;
