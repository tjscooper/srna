import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import Home from "./containers/Home";
import SetUpRun from "./components/SetUpRun";
import NotFound from "./containers/NotFound";
import Login from "./containers/Login";
import Technical from "./containers/Technical";
import References from "./containers/References";


export default function Routes() {
  return (
    <Switch>
		<Route exact path="/">
			<Home />
		</Route>
		<Route to="/technical">
			<Technical />
		</Route>
		<Route exact path="/references">
			<References />
		</Route>
		{/* Finally, catch all unmatched routes */}
		<Route>
			<NotFound />
		</Route>
    </Switch>
  );
}