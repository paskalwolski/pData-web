import { createTheme } from "@mui/material";
import { PaletteColor, PaletteColorOptions } from "@mui/material/styles";

let theme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#b8a1ec",
        },
        secondary: {
            main: "#2e7d32",
        },
        error: {
            main: "#c62828",
        },
        success: {
            main: "#00c853",
        },
    },
    typography: {
        fontFamily: "Inter",
    },
});

theme = createTheme(theme, {
    palette: {
        green: theme.palette.augmentColor({
            color: {
                main: "#00c853",
            },
            name: "green",
        }),
        blue: theme.palette.augmentColor({
            color: {
                main: "#3066bc",
            },
            name: "blue",
        }),
        yellow: theme.palette.augmentColor({
            color: {
                main: "#ffe44d",
            },
            name: "yellow",
        }),
        red: theme.palette.augmentColor({
            color: {
                main: "#dc3b3b",
            },
            name: "red",
        }),
        purple: theme.palette.augmentColor({
            color: {
                main: "#b8a1ec",
            },
            name: "purple",
        }),
    },
});

declare module "@mui/material/styles" {
    interface Palette {
        green: PaletteColor;
        blue: PaletteColor;
        yellow: PaletteColor;
        red: PaletteColor;
        purple: PaletteColor;
    }

    interface PaletteOptions {
        green?: PaletteColorOptions;
        blue?: PaletteColorOptions;
        yellow?: PaletteColorOptions;
        red?: PaletteColorOptions;
        purple?: PaletteColorOptions;
    }
}

export default theme;
