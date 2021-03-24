import React, { useEffect, useState } from "react";
import { AuthWrapper } from "./Auth";
import "./App.css";
import { Visual } from "./Visual";
import { IndexPage } from "./IndexPage";
import { clientId, redirectUri, tenantId } from "./build-config.json";
/**
 * Default react App component - React "Entrypoint"
 * @returns React component
 */
function App() {
  const [showIndexPage, setShowIndexPage] = useState<Boolean>(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token && token.length > 0) {
      setShowIndexPage(false);
    }
  }, [setShowIndexPage]);

  return (
    <>
      {showIndexPage ? (
        <IndexPage
          onClick={() => {
            setShowIndexPage(false);
          }}
        ></IndexPage>
      ) : (
        <AuthWrapper
          clientId={clientId}
          redirectUri={redirectUri}
          tenantId={tenantId.length > 0 ? tenantId : undefined}
        >
          <div className="App">
            <Visual />
          </div>
        </AuthWrapper>
      )}
    </>
  );
}

export default App;
