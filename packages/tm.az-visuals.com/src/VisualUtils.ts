import { Endpoint, Profile } from "@azure/arm-trafficmanager/esm/models";
import { DepGraph } from "dependency-graph";
import {
  Orientation,
  RawNodeDatum,
  TreeLinkDatum,
} from "react-d3-tree/lib/types/common";

/**
 * Serializes a dependency graph to a react-d3-tree dataset
 * @param graph dependency graph to serialize
 * @returns react-d3-tree compatible tree data
 */
export const toTree = (graph: DepGraph<Endpoint & Profile>): RawNodeDatum => {
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

export enum BooleanAttribute {
  True = "true",
  False = "false",
}

export enum EnabledAttribute {
  Unknown = "",
  Enabled = "Enabled",
  Disabled = "Disabled",
}

export interface DataAttributes extends Record<string, string> {
  type: string;
  routingMethod: string;
  monitorStatus: string;
  enabled: EnabledAttribute;
  activeAndEnabled: BooleanAttribute;
}

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
const isActiveAndEnabled = (data: Endpoint & Profile): BooleanAttribute => {
  if (data.type === "Microsoft.Network/trafficManagerProfiles") {
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
 * @returns attribute records
 */
export const selectAttributes = (data: Endpoint & Profile): DataAttributes => {
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
  console.log(target);

  return targetAttrs.activeAndEnabled === BooleanAttribute.True
    ? "active-link"
    : "inactive-link";
};
