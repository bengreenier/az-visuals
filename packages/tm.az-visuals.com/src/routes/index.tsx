import React from "react";
import { HashRouter, Link, Route, Switch } from "react-router-dom";
import {
  ApiType,
  subscriptionParam,
  TrafficManagerPage,
  trafficManagerParam,
} from "./traffic-manager/TrafficManager";
import {
  clientId,
  redirectUri,
  tenantId,
  apiType,
  apiUrl,
} from "../build-config.json";
import { AuthWrapper } from "../Auth";

const trafficManagerRoute = "traffic-managers";
const subscriptionsRoute = "subscriptions";

export default function AppRouter() {
  return (
    <AuthWrapper
      clientId={clientId}
      redirectUri={redirectUri}
      tenantId={tenantId ?? "common"}
    >
      <HashRouter>
        <Switch>
          <Route exact path="/">
            <div>
              <h1>
                Az-Visuals{" "}
                <small>
                  A collection of web-based tools for visualizing Azure
                  resources. ☁🔎🎁
                </small>
              </h1>
              <h3>Available Tools:</h3>
              <ul>
                <li>
                  <Link
                    to={`/${subscriptionsRoute}/all/${trafficManagerRoute}/all`}
                  >
                    Traffic Managers
                  </Link>
                </li>
              </ul>
            </div>
          </Route>
          <Route
            path={`/${subscriptionsRoute}/:${subscriptionParam}/${trafficManagerRoute}/:${trafficManagerParam}`}
          >
            <TrafficManagerPage
              api={{ type: apiType as ApiType, url: apiUrl }}
            />
          </Route>
        </Switch>
      </HashRouter>
    </AuthWrapper>
  );
}
