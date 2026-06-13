import { Switch, Route } from "wouter";
import { Container, Typography } from "@mui/material";
import { AppControlBar } from "./components/AppControls/AppControlBar";
import { useToggle } from "./hooks/useToggle";
import { Homepage } from "./pages/HomePage";
import { LapDataPage } from "./pages/LapDataPage";
import { LapSelectorPage } from "./pages/LapSelectorPage";
import { useCTDContext } from "./hooks/CTDContext/useCTDContext";

export default function App() {
    const { loading } = useCTDContext();
    const [isDrawerOpen, toggleDrawerOpen] = useToggle(false);

    return loading ? (
        <Typography>Loading...</Typography>
    ) : (
        <>
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
        </>
    );
}
