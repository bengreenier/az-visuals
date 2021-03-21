import { useContext, useEffect, useState } from "react";
import { ServiceClientCredentials } from "@azure/ms-rest-js";
import { AuthWrapperContext } from "./Auth";
import { SubscriptionClient } from "@azure/arm-subscriptions";
import { TrafficManagerManagementClient } from "@azure/arm-trafficmanager";
import { graph } from "@az-visuals/hierarchy";
import { Endpoint, Profile } from "@azure/arm-trafficmanager/esm/models";
import { DepGraph } from "dependency-graph";
import Tree from "react-d3-tree";
import { RawNodeDatum } from "react-d3-tree/lib/types/common";

/**
 * Helper to determine if object is null or undefined
 * @param data any object
 * @returns true if null or undefined, otherwise false
 */
const isNullOrUndefined = (data: unknown) =>
  typeof data === "undefined" || data === null;

/**
 * Options for the graph walker to traverse TM data
 */
const walkerOpts: graph.WalkerOpts<Profile & Endpoint> = {
  /**
   * Informs the graph walker if data should be ignored
   * @param data profile/endpoint data
   * @returns true if the data should be ignored
   */
  isIgnored: (data) =>
    isNullOrUndefined(data) ||
    !(
      data.type === "Microsoft.Network/trafficManagerProfiles" ||
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
    return (
      !isNullOrUndefined(data) &&
      data.type === "Microsoft.Network/trafficManagerProfiles"
    );
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
    strip: () => ["endpoints", "tags"],
  },
};

/**
 * Serializes a dependency graph to a react-d3-tree dataset
 * @param graph dependency graph to serialize
 * @returns react-d3-tree compatible tree data
 */
const toTree = (graph: DepGraph<Endpoint & Profile>): RawNodeDatum => {
  // TODO(bengreenier): support multiple "roots"
  // by handling all top level nodes returned by this call, rather than just [0]
  const topLevel = graph.overallOrder(true)[0];
  const raw = graph.getNodeData(topLevel);
  return {
    name: raw.name as string,
    attributes: selectAttributes(raw),
    children: toSubTree(graph, topLevel),
  };
};

/**
 * Serializes a dependency sub graph to a react-d3-tree sub dataset
 * Should not be called directly, used by @see toTree
 * @param graph dependency sub graph to serialize
 * @param root sub graph root name
 * @returns react-d3-tree compatible subtree data
 */
const toSubTree = (
  graph: DepGraph<Endpoint & Profile>,
  root: string
): RawNodeDatum[] => {
  return graph.directDependantsOf(root).map((next) => {
    const raw = graph.getNodeData(next);
    return {
      name: raw.name as string,
      attributes: selectAttributes(raw),
      children: toSubTree(graph, next),
    };
  });
};

/**
 * Parse endpoint/profile data into pre-defined attributes object
 * @param data endpoint/profile data
 * @returns attribute records
 */
const selectAttributes = (data: Endpoint & Profile): Record<string, string> => {
  // select just the things we care about rendering
  return {
    type: data.type || "",
    routingMethod: data.trafficRoutingMethod || "",
    monitorStatus:
      data.monitorConfig?.profileMonitorStatus ||
      data.endpointMonitorStatus ||
      "",
    enabled: data.profileStatus || data.endpointStatus || "",
  };
};

/**
 * Load all traffic managers the user is authorized to access, and serialize them to a tree
 * @param creds Azure credentials object
 * @returns react-d3-tree compatible dataset
 */
const loadAll = async (creds: ServiceClientCredentials) => {
  const subClient = new SubscriptionClient(creds);

  // TODO(bengreenier): We should be able to correlate subs and tenants, but we apparently cannot
  // so, for now, we assume the first tenant is what you want
  const tenants = await subClient.tenants.list();

  // TODO(bengreenier): Use this to generate portal urls as-per the docs
  // https://github.com/Azure/portaldocs/blob/45b60564f5341da629081f3ff3aa306ff909e8ab/portal-sdk/generated/portalfx-links.md#resources
  const defaultTenant = tenants[0].tenantId as string;

  const subs = await subClient.subscriptions.list();
  const clients = subs.map(
    (s) => new TrafficManagerManagementClient(creds, s.subscriptionId as string)
  );

  const profileLists = await Promise.all(
    // TODO(bengreenier): This API apparently excludes properties.monitorConfig.profileMonitorStatus which is real annoying
    // To workaround this and get that data, we should look at batch API, or fall back to individual profile GETs
    clients.map((c) => c.profiles.listBySubscription())
  );

  const profiles = profileLists.flat();

  const walker = new graph.Walker(walkerOpts);
  const tree = walker.walkAndBuild(profiles);

  return toTree(tree);
};

/**
 * TrafficManager profile tree visual component
 * @returns React component
 */
export const Visual = () => {
  // consume the auth wrapper context for credential access
  const ctx = useContext(AuthWrapperContext);
  const { credentials } = ctx;

  const [tree, setTree] = useState<RawNodeDatum>();

  // load the tms, and get the resulting tree structure
  useEffect(() => {
    loadAll(credentials).then((visualTree) => {
      setTree(visualTree);
    });
  }, [credentials]);

  // create the tree visual
  return (
    <div style={{ width: `100vw`, height: `100vh` }}>
      {tree ? (
        <Tree data={tree} depthFactor={500} nodeSize={{ x: 400, y: 400 }} />
      ) : (
        <h1>Loading...</h1>
      )}
    </div>
  );
};
