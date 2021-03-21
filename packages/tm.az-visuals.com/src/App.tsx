import React from "react";
import { AuthWrapper } from "./Auth";
import "./App.css";
import { Visual } from "./Visual";

/**
 * Default react App component - React "Entrypoint"
 * @returns React component
 */
function App() {
  return (
    <AuthWrapper
      clientId="56b74d6c-2ee9-4384-adae-06c968b6ee1b"
      redirectUri="http://localhost:3000"
    >
      <div className="App">
        <Visual />
      </div>
    </AuthWrapper>
  );
}

export default App;
