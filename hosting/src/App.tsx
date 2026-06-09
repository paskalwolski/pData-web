import { Switch, Route } from "wouter";
import { Container, ThemeProvider } from "@mui/material";
import theme from "./theme";
import { AppControlBar } from "./components/AppControls/AppControlBar";
import { useToggle } from "./hooks/useToggle";
import { Homepage } from "./pages/HomePage";
import { LapDataPage } from "./pages/LapDataPage";
import { LapSelectorPage } from "./pages/LapSelectorPage";

export default function App() {
    const [isDrawerOpen, toggleDrawerOpen] = useToggle(false);
    return (
        <ThemeProvider theme={theme}>
            <AppControlBar
                isDrawerOpen={isDrawerOpen}
                toggleDrawerOpen={toggleDrawerOpen}
            />
            <Container maxWidth={false} sx={{ padding: 2 }}>
                <Switch>
                    <Route path="/laps/:lapId/compare/:secondaryId">
                        {({
                            lapId,
                            secondaryId,
                        }: {
                            lapId: string;
                            secondaryId: string;
                        }) => (
                            <LapDataPage
                                lapId={lapId}
                                secondaryLapId={secondaryId}
                            />
                        )}
                    </Route>
                    <Route path="/laps/:lapId">
                        {({ lapId }: { lapId: string }) => (
                            <LapDataPage lapId={lapId} />
                        )}
                    </Route>
                    <Route path="/laps" component={LapSelectorPage} />
                    <Route path="/" component={Homepage} />
                </Switch>
            </Container>
        </ThemeProvider>
    );
}
