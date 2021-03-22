import React from "react";
import { AuthWrapper } from "./Auth";
import "./App.css";
import { Visual } from "./Visual";
import { clientId, redirectUri } from "./build-config.json";
/**
 * Default react App component - React "Entrypoint"
 * @returns React component
 */
function App() {
  return (
    <AuthWrapper clientId={clientId} redirectUri={redirectUri}>
      <div className="App">
        <Visual />
      </div>
    </AuthWrapper>
  );
}

export default App;
