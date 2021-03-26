/**
 * Types of APIs we support
 */
export enum ApiType {
  /**
   * This will directly query azure
   */
  Azure = "azure",

  /**
   * This will query a custom endpoint
   */
  Custom = "custom",
}

/**
 * Runtime manifest describes how the client app will behave at runtime
 * It is queried during client application startup
 */
export interface RuntimeManifest {
  /**
   * The api type to use
   */
  apiType: ApiType;

  /**
   * Properties for if apiType == custom
   */
  custom?: {
    /**
     * Url to query traffic managers from
     */
    url: string;
  };

  /**
   * Properties for if apiType == azure
   */
  azure?: {
    /**
     * Client id for aad authentication
     */
    clientId: string;

    /**
     * Tenant id for aad authentication
     */
    tenantId: string;

    /**
     * Redirect uri to use for aad authentication
     */
    redirectUri: string;
  };

  /**
   * Hostname property for building portal urls.
   * Should not include protocol nor trailing slash.
   */
  portalHostname: string;
}
