import { useContext, useEffect, useState } from "react";
import { ServiceClientCredentials } from "@azure/ms-rest-js";
import { AuthWrapperContext } from "./Auth";
import { SubscriptionClient } from "@azure/arm-subscriptions";
import { TrafficManagerManagementClient } from "@azure/arm-trafficmanager";
import { graph } from "@az-visuals/hierarchy";
import { Endpoint } from "@azure/arm-trafficmanager/esm/models";
import Tree from "react-d3-tree";
import { RawNodeDatum } from "react-d3-tree/lib/types/common";
import { renderVisualNode } from "./VisualNode";
import { determinePathClass, GraphData, toTree } from "./VisualUtils";
import "./Visual.css";

/**
 * Helper to determine if object is null or undefined
 * @param data any object
 * @returns true if null or undefined, otherwise false
 */
const isNullOrUndefined = (data: unknown) =>
  typeof data === "undefined" || data === null;

/**
 * Helper to extract azure resource group and name
 * @param resourceId the azure resource id
 */
const extractIdName = (resourceId: string) => {
  const matched = /\/resourceGroups\/(.+?)\/providers\/Microsoft.Network\/trafficManagerProfiles\/(.+)\/?/.exec(
    resourceId
  );
  if (matched == null || matched.length < 2) {
    throw new Error(`Invalid resourceId: '${resourceId}'`);
  }

  return { resourceGroup: matched[1], name: matched[2] };
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
    strip: () => ["tags"],
  },
};

/**
 * Load all traffic managers the user is authorized to access, and serialize them to a tree
 * @param creds Azure credentials object
 * @param useDetailedApi Flag to use the slower but more detailed api to query properties for every TM individually.
 * Workaround for including properties.monitorConfig.profileMonitorStatus
 * @returns react-d3-tree compatible dataset
 */
const loadAll = async (
  creds: ServiceClientCredentials,
  useDetailedApi = true
) => {
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
    clients.map((c) =>
      c.profiles.listBySubscription().then(async (list) => {
        // detailed API works around missing fields, but is WAY heavier
        if (useDetailedApi) {
          const innerProfileLists = list.map((profile) => {
            const { resourceGroup, name } = extractIdName(profile.id as string);
            return c.profiles.get(resourceGroup, name);
          });

          return await Promise.all(innerProfileLists);
        } else {
          return list;
        }
      })
    )
  );

  const profiles = profileLists
    .flat()
    .map((p) => ({ ...p, tenantId: defaultTenant }));

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
        <Tree
          data={tree}
          orientation={"vertical"}
          depthFactor={500}
          nodeSize={{ x: 400, y: 400 }}
          pathClassFunc={determinePathClass}
          renderCustomNodeElement={renderVisualNode}
        />
      ) : (
        <h1>Loading...</h1>
      )}
    </div>
  );
};
