import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";
import { ThemeProvider } from "@mui/material";
import theme from "./theme.ts";
import App from "./App.tsx";
import { CTDProvider } from "./context/CTDContext/useCTDContext.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <CTDProvider>
                <App />
            </CTDProvider>
        </ThemeProvider>
    </StrictMode>,
);
