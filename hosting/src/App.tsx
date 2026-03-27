import { Switch, Route } from "wouter";
import { Box, Container, ThemeProvider } from "@mui/material";
import theme from "./theme";
import { AppControlBar } from "./components/AppControls/AppControlBar";
import { useToggle } from "./hooks/useToggle";
import { CustomDrawer } from "./components/AppControls/CustomDrawer";
import { Homepage } from "./views/HomePage";

export default function App() {
    const [isDrawerOpen, toggleDrawerOpen] = useToggle(false);
    return (
        <ThemeProvider theme={theme}>
            <AppControlBar
                isDrawerOpen={isDrawerOpen}
                toggleDrawerOpen={toggleDrawerOpen}
            />
            <Box display="flex" height="100vh" overflow={"auto"}>
                <CustomDrawer
                    isDrawerOpen={isDrawerOpen}
                    toggleDrawerOpen={toggleDrawerOpen}
                />
                <Container>
                    <Switch>
                        <Route path="/" component={Homepage} />
                    </Switch>
                </Container>
            </Box>
        </ThemeProvider>
    );
}
