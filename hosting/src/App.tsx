import { Switch, Route } from "wouter";
import OldHomepage from "./OldHomepage";
import { ThemeProvider, Typography } from "@mui/material";
import theme from "./theme";

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <Typography variant="h3">pData</Typography>
            <Switch>
                <Route path="/" component={OldHomepage}></Route>
            </Switch>
        </ThemeProvider>
    );
}
