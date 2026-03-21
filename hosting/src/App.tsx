import { Switch, Route } from "wouter";
import OldHomepage from "./OldHomepage";
import { Box, Container, ThemeProvider } from "@mui/material";
import theme from "./theme";
import { AppControlBar } from "./components/AppControls/AppControlBar";
import { useToggle } from "./hooks/useToggle";
import { CustomDrawer } from "./components/AppControls/CustomDrawer";

export default function App() {
    const [isDrawerOpen, toggleDrawerOpen] = useToggle(false);
    return (
        <ThemeProvider theme={theme}>
            <AppControlBar
                isDrawerOpen={isDrawerOpen}
                toggleDrawerOpen={toggleDrawerOpen}
            />
            <Box display="flex">
                <CustomDrawer
                    isDrawerOpen={isDrawerOpen}
                    toggleDrawerOpen={toggleDrawerOpen}
                />
                <Container>
                    <Switch>
                        <Route path="/" component={OldHomepage}></Route>
                    </Switch>
                </Container>
            </Box>
        </ThemeProvider>
    );
}
