import {
  createContext,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ServiceClientCredentials, TokenCredentials } from "@azure/ms-rest-js";
import { AuthManager } from "@azure/ms-rest-browserauth";
import { parse as parseQuery } from "querystring";

/**
 * Logout function type
 */
export type LogoutFunction = () => void;

/**
 * Internal-only types for @see AuthWrapperContext
 */
interface ContextType {
  credentials: ServiceClientCredentials;
  logout: LogoutFunction;
}

/**
 * React context for accessing auth information
 * Only valid from within an @see AuthWrapper
 */
export const AuthWrapperContext = createContext<ContextType>({
  credentials: {
    signRequest: () => {
      return Promise.reject(new Error(`Not Implemented`));
    },
  },
  logout: () => {
    throw new Error(`Not Implemented`);
  },
});

/**
 * @see AuthWrapper component properties
 */
interface Props {
  /**
   * Flag indicating if auth is enabled
   */
  enabled: boolean;

  /**
   * The AAD client id to authenticate with
   */
  clientId: string;

  /**
   * The AAD redirectUri to call back to
   * @example http://localhost:3000
   */
  redirectUri: string;

  /**
   * The (optional) AAD tenantId to force authentication to use
   */
  tenantId?: string;

  /**
   * Flag indicating if redirect state will be logged
   * Useful for debugging
   */
  logRedirectInfo?: boolean;
}

/**
 * Internal-only type of the inbound request querstring that may already contain a token
 * If a token is present, it is used instead of AAD auth
 */
interface InboundQuerystring {
  /**
   * Optional token to use instead of AAD auth
   */
  token?: string;
}

/**
 * Auth component for wrapping children element inside an authenticated view
 * @param props properties
 * @returns React component
 */
export const AuthWrapper = (props: PropsWithChildren<Props>) => {
  const { enabled, clientId, tenantId, redirectUri, logRedirectInfo } = props;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    enabled ? false : true
  );
  const [credentials, setCredentials] = useState<ServiceClientCredentials>();

  // create the add auth manager
  const authManager = useMemo(
    () =>
      new AuthManager({
        clientId,
        tenant: tenantId,
        redirectUri,
      }),
    [clientId, tenantId, redirectUri]
  );

  const logout = useMemo(() => {
    return () => {
      authManager.logout();
    };
  }, [authManager]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // parse out the querystring, checking for a token
    const qs: InboundQuerystring = parseQuery(
      document.location.href.split("?")[1] || ""
    );

    // if we're using "real" auth
    if (!qs || !qs.token) {
      // we log the hash contents because in a login failure AAD may share info about the failure
      // in there, and we'll want to be able to read it.
      if (logRedirectInfo || true) {
        console.log(`Login begin: ${document.location.hash}`);
      }

      // complete the auth dance
      authManager.finalizeLogin().then((res) => {
        if (!res.isLoggedIn) {
          setIsAuthenticated(false);
          setCredentials(undefined);
          authManager.login();
        } else {
          setCredentials(res.creds);
          setIsAuthenticated(true);
        }
      });
    }
    // if we're using token pass through
    else {
      // just setup the token and proceed, no auth dance needed
      setCredentials(new TokenCredentials(qs.token));
      setIsAuthenticated(true);
    }
  }, [enabled, authManager, logRedirectInfo]);

  // render the component, including it's children within the wrapper context
  return (
    <>
      {isAuthenticated ? (
        <AuthWrapperContext.Provider value={{ credentials, logout }}>
          {props.children}
        </AuthWrapperContext.Provider>
      ) : (
        <h1>Redirecting for authentication...</h1>
      )}
    </>
  );
};
