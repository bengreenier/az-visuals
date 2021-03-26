import { ServiceClientCredentials } from "@azure/ms-rest-js";
import { SubscriptionClient } from "@azure/arm-subscriptions";
import { TrafficManagerManagementClient } from "@azure/arm-trafficmanager";
import { Subscription } from "@azure/arm-subscriptions/esm/models";
import { Endpoint, Profile } from "@azure/arm-trafficmanager/esm/models";
import { graph } from "@az-visuals/hierarchy";
import { DepGraph } from "dependency-graph";
import {
  Orientation,
  RawNodeDatum,
  TreeLinkDatum,
} from "react-d3-tree/lib/types/common";

/**
 * The graph data type used throughout visual components
 */
export type GraphData = Endpoint & Profile & { tenantId: string };

/**
 * Type of the traffic manager profile
 */
export const TM_PROFILE_TYPE = "Microsoft.Network/trafficManagerProfiles";

/**
 * The default node circle radius for the custom node element
 */
export const DEFAULT_NODE_CIRCLE_RADIUS = 15;

/**
 * The settings for the text rendering of the custom node element
 */
export const textLayout = {
  title: {
    textAnchor: "start",
    x: 40,
  },
  attribute: {
    x: 40,
    dy: "1.2em",
  },
};

/**
 * Augmented subscription type
 */
type SubscriptionWithTenantId = Subscription & { tenantId: string };

/**
 * Loads azure subscriptions
 * @param cred credential to use
 * @param subFilter subscription filter - works on names or ids
 * @returns subscriptions
 */
const loadSubscriptions = async (
  cred: ServiceClientCredentials,
  subFilter: RegExp
): Promise<SubscriptionWithTenantId[]> => {
  const client = new SubscriptionClient(cred);

  // for now, we use the first tenantId for all subs, since the API
  // does not expose a sub<->tenant mapping
  const tenants = await client.tenants.list();
  const firstTenantId = tenants[0].tenantId as string;

  const subs = await client.subscriptions.list();

  return subs
    .filter(
      (s) =>
        subFilter.test(s.displayName as string) ||
        subFilter.test(s.subscriptionId as string)
    )
    .map((s) => ({ ...s, tenantId: firstTenantId }));
};

/**
 * Helper to inflate a traffic manager profile to include it's full dataset
 * @param client traffic manager client
 * @param profile profile to inflate
 * @returns inflated profile
 */
const inflateProfileAsNeeded = async (
  client: TrafficManagerManagementClient,
  profile: Profile
) => {
  const rgName = extractIdName(profile.id as string).resourceGroup;
  if (
    profile.endpoints &&
    profile.endpoints.find((e) => e.type !== TM_PROFILE_TYPE)
  ) {
    const data = await client.profiles.get(rgName, profile.name as string);
    return { ...data, rgName };
  } else {
    return { ...profile, rgName };
  }
};

/**
 * Load traffic managers from subscriptions
 * @param cred credential to use
 * @param subs subscriptions to scan
 * @param tmFilter traffic manager name filter
 * @returns traffic managers
 */
const loadTrafficManagers = async (
  cred: ServiceClientCredentials,
  subs: SubscriptionWithTenantId[],
  tmFilter: RegExp
) => {
  const clients = subs.map((s) => ({
    client: new TrafficManagerManagementClient(
      cred,
      s.subscriptionId as string
    ),
    tenantId: s.tenantId,
  }));

  const profileLists = await Promise.all(
    clients.map((c) =>
      c.client.profiles.listBySubscription().then(async (list) => {
        const inflatedList = await Promise.all(
          list.map((p) => inflateProfileAsNeeded(c.client, p))
        );
        return inflatedList.map((p) => ({
          ...p,
          tenantId: c.tenantId,
        }));
      })
    )
  );
  const profiles = profileLists.flat();

  return profiles.filter((p) => tmFilter.test(p.name as string));
};

/**
 * Options for the graph walker to traverse TM data
 */
const walkerOpts: graph.WalkerOpts<GraphData> = {
  /**
   * Informs the graph walker if data should be ignored
   * @param data profile/endpoint data
   * @returns true if the data should be ignored
   */
  isIgnored: (data) =>
    isNullOrUndefined(data) ||
    !(
      data.type === TM_PROFILE_TYPE ||
      data.type ===
        "Microsoft.Network/trafficManagerProfiles/nestedEndpoints" ||
      data.type === "Microsoft.Network/trafficManagerProfiles/azureEndpoints" ||
      data.type === "Microsoft.Network/trafficManagerProfiles/externalEndpoints"
    ),
  /**
   * Informs the graph walker if data represents a root, or a leaf
   * @param data profile/endpoint data
   * @returns true if the data represents a "parent" type that may have children under it
   */
  isParent: (data) => {
    return !isNullOrUndefined(data) && data.type === TM_PROFILE_TYPE;
  },
  /**
   * Field info for the graph walker
   */
  fields: {
    /**
     * The data property to use as the node id
     */
    id: "id",
    /**
     * The data property to use as the node type
     */
    type: "type",
    /**
     * Utility method the walker will use to parse out the id from the data
     * @param data profile/endpoint data
     * @returns id
     */
    getId: (data) =>
      ((data as Endpoint)["targetResourceId"] as string) ??
      (data["id"] as string),

    /**
     * Utility method the walker will use to parse out the type from the data
     * @param data profile/endpoint data
     * @returns type
     */
    getType: (data) => data.type as string,

    /**
     * Utility method used to remove certain fields from the data
     * @returns fields to strip
     */
    strip: () => ["tags"],
  },
};

/**
 * Load graph using azure apis
 * @param creds credentials to use
 * @param subscriptionFilter subscription filter
 * @param trafficManagerFilter traffic manager filter
 * @returns graph
 */
export const loadGraph = async (
  creds: ServiceClientCredentials,
  subscriptionFilter: RegExp,
  trafficManagerFilter: RegExp
) => {
  const subs = await loadSubscriptions(creds, subscriptionFilter);
  const tms = await loadTrafficManagers(creds, subs, trafficManagerFilter);

  const instance = new graph.Walker(walkerOpts);
  return instance.walkAndBuild(tms);
};

/**
 * Load graph using external apis
 * @param url url to query
 * @param subscriptionFilter subscription filter
 * @param trafficManagerFilter traffic manager filter
 * @returns graph
 */
export const loadGraphExternal = async (
  url: string,
  subscriptionFilter: RegExp,
  trafficManagerFilter: RegExp
) => {
  const parsedUrl = new URL(url);
  const filterSearch = `subscriptionFilter=${encodeURIComponent(
    subscriptionFilter.source
  )}&trafficManagerFilter=${encodeURIComponent(trafficManagerFilter.source)}`;

  let reqUrl = `${parsedUrl.origin}${parsedUrl.pathname}`;

  if (parsedUrl.search && parsedUrl.search.length > 0) {
    reqUrl += `${parsedUrl.search}&${filterSearch}`;
  } else {
    reqUrl += `?${filterSearch}`;
  }

  const res = await fetch(reqUrl);
  const data = (await res.json()) as GraphData;

  const instance = new graph.Walker(walkerOpts);
  return instance.walkAndBuild(data);
};

/**
 * parse a string value as a matcher param and generate regexp
 * @param param string value
 * @returns regexp
 */
export const parseMatcherParam = (param: string) => {
  if (param === "all") {
    return /.+/;
  } else {
    return new RegExp(param);
  }
};

/**
 * Serializes a dependency graph to a react-d3-tree dataset
 * @param graph dependency graph to serialize
 * @param topLevel name of root node to show
 * @param portalHostname the portal hostname to use
 * @returns react-d3-tree compatible tree data
 */
export const toTree = (
  graph: DepGraph<GraphData>,
  topLevel: string,
  portalHostname: string
): RawNodeDatum => {
  const raw = graph.getNodeData(topLevel);
  return {
    name: raw.name as string,
    attributes: selectAttributes(raw, portalHostname),
    children: toSubTree(graph, topLevel, portalHostname),
  };
};

/**
 * Serializes a dependency sub graph to a react-d3-tree sub dataset
 * Should not be called directly, used by @see toTree
 * @param graph dependency sub graph to serialize
 * @param root sub graph root name
 * @param portalHostname the portal hostname to use
 * @returns react-d3-tree compatible subtree data
 */
const toSubTree = (
  graph: DepGraph<GraphData>,
  root: string,
  portalHostname: string
): RawNodeDatum[] => {
  return graph.directDependantsOf(root).map((next) => {
    const raw = graph.getNodeData(next);

    // fixup endpoint nodes to include tenantId from parent nodes
    if (!raw.tenantId) {
      raw.tenantId = graph.getNodeData(root).tenantId;
    }

    return {
      name: raw.name as string,
      attributes: selectAttributes(raw, portalHostname),
      children: toSubTree(graph, next, portalHostname),
    };
  });
};

/**
 * Boolean string representation
 */
export enum BooleanAttribute {
  True = "true",
  False = "false",
}

/**
 * Enabled string representation
 */
export enum EnabledAttribute {
  Unknown = "",
  Enabled = "Enabled",
  Disabled = "Disabled",
}

/**
 * Node data attributes type information
 */
export interface DataAttributes extends Record<string, string> {
  type: string;
  routingMethod: string;
  monitorStatus: string;
  enabled: EnabledAttribute;
  activeAndEnabled: BooleanAttribute;
  portalUrl: string;
}

/**
 * Build a portal url
 * @see https://github.com/Azure/portaldocs/blob/45b60564f5341da629081f3ff3aa306ff909e8ab/portal-sdk/generated/portalfx-links.md#resources
 * @param portalHostname the portal hostname to use
 * @param tenantId azure ad tenant id
 * @param resourceId azure resource id
 */
const buildPortalUrl = (
  portalHostname: string,
  tenantId: string,
  resourceId: string
) => {
  return `https://${portalHostname}/#@{${tenantId}}/resource${resourceId}`;
};

/**
 * Determine if an endpoint is healthy given the data
 * @param data endpoint
 * @returns health status
 */
const isHealthyEndpoint = (data: Endpoint): boolean => {
  return (
    data.endpointStatus === EnabledAttribute.Enabled &&
    data.endpointMonitorStatus !== "Degraded" &&
    data.endpointMonitorStatus !== "Disabled" &&
    data.endpointMonitorStatus !== "Inactive" &&
    data.endpointMonitorStatus !== "Stopped"
  );
};

/**
 * Determines if a profile/endpoint is active and enabled
 * @param data data to inspect
 */
const isActiveAndEnabled = (data: GraphData): BooleanAttribute => {
  if (data.type === TM_PROFILE_TYPE) {
    const hasHealthyEndpoint =
      data.endpoints?.some((e) => isHealthyEndpoint(e)) ?? false;
    return data.profileStatus === EnabledAttribute.Enabled && hasHealthyEndpoint
      ? BooleanAttribute.True
      : BooleanAttribute.False;
  } else {
    return data.endpointStatus === EnabledAttribute.Enabled &&
      isHealthyEndpoint(data)
      ? BooleanAttribute.True
      : BooleanAttribute.False;
  }
};

/**
 * Parse endpoint/profile data into pre-defined attributes object
 * @param data endpoint/profile data
 * @param portalHostname the portal hostname to use
 * @returns attribute records
 */
export const selectAttributes = (
  data: GraphData,
  portalHostname: string
): DataAttributes => {
  // select just the things we care about rendering
  return {
    type: data.type || "",
    routingMethod: data.trafficRoutingMethod || "",
    monitorStatus:
      data.monitorConfig?.profileMonitorStatus ||
      data.endpointMonitorStatus ||
      "",
    enabled: (data.profileStatus ||
      data.endpointStatus ||
      "") as EnabledAttribute,
    activeAndEnabled: isActiveAndEnabled(data),
    portalUrl: buildPortalUrl(portalHostname, data.tenantId, data.id as string),
  };
};

/**
 * Determine the class to use for the link
 * @param link the link
 * @param _ the link orientation
 */
export const determinePathClass = (link: TreeLinkDatum, _: Orientation) => {
  const { target } = link;
  const targetAttrs = target.data.attributes as DataAttributes;

  return targetAttrs.activeAndEnabled === BooleanAttribute.True
    ? "active-link"
    : "inactive-link";
};

/**
 * Helper to determine if object is null or undefined
 * @param data any object
 * @returns true if null or undefined, otherwise false
 */
export const isNullOrUndefined = (data: unknown) =>
  typeof data === "undefined" || data === null;

/**
 * Helper to extract azure resource group and name
 * @param resourceId the azure resource id
 */
export const extractIdName = (resourceId: string) => {
  const matched = /\/resourceGroups\/(.+?)\/providers\/Microsoft.Network\/trafficManagerProfiles\/(.+)\/?/.exec(
    resourceId
  );
  if (matched == null || matched.length < 2) {
    throw new Error(`Invalid resourceId: '${resourceId}'`);
  }

  return { resourceGroup: matched[1], name: matched[2] };
};
