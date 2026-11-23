import { Switch, Route } from "wouter";
import { Container } from "@mui/material";
import { AppControlBar } from "./components/AppControls/AppControlBar";
import { useToggle } from "./hooks/useToggle";
import { Homepage } from "./pages/HomePage";

import { useCTDContext } from "./hooks/CTDContext/useCTDContext";
import { lazy, Suspense } from "react";
import { CarSpinner } from "./components/CarSpinner";

const LapDataPage = lazy(() => import("./pages/LapDataPage"));
const SessionDataPage = lazy(() => import("./pages/SessionDataPage"));
const LapSelectorPage = lazy(() => import("./pages/LapSelectorPage"));
const SessionSelectorPage = lazy(
    () => import("./pages/SessionSelectorPage"),
);

export default function App() {
    const { loading } = useCTDContext();
    const [isDrawerOpen, toggleDrawerOpen] = useToggle(false);

    return loading ? (
        <CarSpinner />
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
                            <Suspense fallback={<CarSpinner />}>
                                <LapDataPage
                                    lapId={lapId}
                                    secondaryLapId={secondaryId}
                                />
                            </Suspense>
                        )}
                    </Route>
                    <Route path="/laps/:lapId">
                        {({ lapId }: { lapId: string }) => (
                            <Suspense fallback={<CarSpinner />}>
                                <LapDataPage lapId={lapId} />
                            </Suspense>
                        )}
                    </Route>
                    <Route path="/laps">
                        <Suspense fallback={<CarSpinner />}>
                            <LapSelectorPage />
                        </Suspense>
                    </Route>
                    <Route path="/sessions/:sessionId">
                        {({ sessionId }: { sessionId: string }) => (
                            <Suspense fallback={<CarSpinner />}>
                                <SessionDataPage sessionId={sessionId} />
                            </Suspense>
                        )}
                    </Route>
                    <Route path="/sessions">
                        <Suspense fallback={<CarSpinner />}>
                            <SessionSelectorPage />
                        </Suspense>
                    </Route>
                    <Route path="/" component={Homepage} />
                </Switch>
            </Container>
        </>
    );
}
