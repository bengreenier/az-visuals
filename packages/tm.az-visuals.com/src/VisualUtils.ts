import { Endpoint, Profile } from "@azure/arm-trafficmanager/esm/models";
import { DepGraph } from "dependency-graph";
import { RawNodeDatum } from "react-d3-tree/lib/types/common";

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
}

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
  };
};
