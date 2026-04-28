import { alpha, createTheme } from '@mui/material/styles'

const primaryMain = '#6d28d9'
const black = '#111111'
const white = '#ffffff'
const yellow = '#facc15'

const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: primaryMain,
      dark: '#4c1d95',
      light: '#8b5cf6',
      contrastText: white,
    },
    secondary: {
      main: yellow,
      dark: '#ca8a04',
      light: '#fde047',
      contrastText: black,
    },
    background: {
      default: white,
      paper: white,
    },
    text: {
      primary: black,
      secondary: '#4b5563',
    },
    divider: alpha(black, 0.08),
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.04em',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingInline: 18,
          minHeight: 44,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: 'none',
          '&:not(.MuiDrawer-paper):not(.MuiCard-root)': {
            border: `1px solid ${alpha(black, 0.08)}`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${alpha(black, 0.08)}`,
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: `linear-gradient(180deg, ${primaryMain} 0%, #581c87 100%)`,
          color: white,
        },
      },
    },
  },
})

export { appTheme }
