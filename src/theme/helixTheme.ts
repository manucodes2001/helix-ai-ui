import { createTheme } from "@mui/material/styles";

export const helixTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0D9488", // Deep scientific teal
      light: "#14B8A6",
      dark: "#0F766E",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#1E3A5F", // Deep indigo / slate blue
      light: "#334E68",
      dark: "#0F172A",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F8FAFC", // Off-white canvas
      paper: "#FFFFFF", // Pure white elevated surfaces
    },
    text: {
      primary: "#0F172A", // Deep slate
      secondary: "#475569", // Medium slate
      disabled: "#94A3B8",
    },
    divider: "#E2E8F0",
    success: {
      main: "#166534",
      light: "#DCFCE7",
      dark: "#14532D",
    },
    warning: {
      main: "#854D0E",
      light: "#FEF9C3",
      dark: "#713F12",
    },
    error: {
      main: "#991B1B",
      light: "#FEE2E2",
      dark: "#7F1D1D",
    },
    info: {
      main: "#0369A1",
      light: "#E0F2FE",
      dark: "#075985",
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: "-0.03em",
      fontSize: "2.25rem",
    },
    h2: {
      fontWeight: 700,
      letterSpacing: "-0.025em",
      fontSize: "1.875rem",
    },
    h3: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
      fontSize: "1.5rem",
    },
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
      fontSize: "1.25rem",
    },
    h5: {
      fontWeight: 600,
      letterSpacing: "-0.015em",
      fontSize: "1.1rem",
    },
    h6: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
      fontSize: "0.95rem",
    },
    subtitle1: {
      fontSize: "0.95rem",
      color: "#475569",
    },
    subtitle2: {
      fontSize: "0.85rem",
      fontWeight: 500,
      color: "#64748B",
    },
    body1: {
      fontSize: "0.9rem",
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.825rem",
      lineHeight: 1.45,
      color: "#475569",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      fontSize: "0.85rem",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F8FAFC",
          color: "#0F172A",
          scrollbarColor: "#CBD5E1 #F1F5F9",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            width: 8,
            height: 8,
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#CBD5E1",
          },
          "&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track": {
            borderRadius: 8,
            backgroundColor: "#F1F5F9",
          },
        },
        ".mono-code": {
          fontFamily: '"JetBrains Mono", monospace !important',
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)",
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "6px 14px",
          transition: "all 0.15s ease-in-out",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 6,
          fontSize: "0.75rem",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderLeft: "1px solid #E2E8F0",
          boxShadow: "-4px 0 24px rgba(15, 23, 42, 0.08)",
        },
      },
    },
  },
});
