import { Switch, Route } from "wouter";
import OldHomepage from "./OldHomepage";

export default function App() {
    return (
        <>
            <h1>pData</h1>
            <Switch>
                <Route path="/" component={OldHomepage}></Route>
            </Switch>
        </>
    );
}
