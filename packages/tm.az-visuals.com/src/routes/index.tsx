import React from "react";
import { HashRouter, Link, Route, Switch } from "react-router-dom";
import {
  subscriptionParam,
  TrafficManagerPage,
  trafficManagerParam,
} from "./traffic-manager/TrafficManager";
import { AuthWrapper } from "../Auth";
import { useRuntimeManifest } from "./router-utils";
import { ApiType, RuntimeManifest } from "../types";

const trafficManagerRoute = "traffic-managers";
const subscriptionsRoute = "subscriptions";

export default function AppRouter() {
  const manifest = useRuntimeManifest();

  return manifest ? (
    <RouterTree manifest={manifest} />
  ) : (
    <h1>Loading runtime</h1>
  );
}

const RouterTree = (props: { manifest: RuntimeManifest }) => {
  const { manifest } = props;
  return (
    <AuthWrapper
      enabled={manifest.apiType === ApiType.Azure}
      clientId={manifest.azure?.clientId ?? ""}
      redirectUri={manifest.azure?.redirectUri ?? ""}
      tenantId={manifest.azure?.tenantId ?? "common"}
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
              api={{
                type: manifest.apiType as ApiType,
                url: manifest.custom?.url ?? "",
              }}
              portalHostname={manifest.portalHostname}
            />
          </Route>
        </Switch>
      </HashRouter>
    </AuthWrapper>
  );
};
