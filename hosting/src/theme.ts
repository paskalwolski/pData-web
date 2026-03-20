import { createTheme } from "@mui/material";

const theme = createTheme({

  palette: {
    mode: 'dark',
    primary: {
      main: '#b8a1ec',
    },
    secondary: {
      main: '#2e7d32',
    },
    error: {
      main: '#c62828',
    },
    success: {
      main: '#00c853',
    },
  },
  typography: {
    fontFamily: 'Inter',},
});

export default theme;
