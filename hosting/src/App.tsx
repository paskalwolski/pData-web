import { Switch, Route } from "wouter";
import OldHomepage from "./OldHomepage";
import { ThemeProvider } from "@mui/material";
import theme from "./theme";
import { AppControlBar } from "./components/AppControlBar";

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <AppControlBar />
            <Switch>
                <Route path="/" component={OldHomepage}></Route>
            </Switch>
        </ThemeProvider>
    );
}
