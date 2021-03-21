import { DepGraph } from "dependency-graph";
import debug from "debug";

/**
 * logger instance for graph
 */
const log = debug(`az-visuals.hierarchy.graph`);
const beforeLog = debug(`az-visuals.hierarchy.graph.before`);

export interface WalkerOpts<TData> {
  isIgnored: (data: TData) => boolean;
  isParent: (data: TData) => boolean;
  fields: {
    id: string;
    type: string;
    getId: (data: TData) => string;
    getType: (data: TData) => string;
    strip: () => Array<keyof TData>;
  };
}

export class Walker<TData> {
  private graph: DepGraph<TData> = new DepGraph<TData>();

  constructor(private options: WalkerOpts<TData>) {}

  public walkAndBuild(data: TData | TData[]) {
    if (Array.isArray(data)) {
      data.forEach((d) => this.walkAndBuildInternal(d));
    } else {
      this.walkAndBuildInternal(data);
    }

    return this.graph;
  }

  private walkAndBuildInternal(data: any, parentData?: any) {
    // parent data is mutable, as a node update might need to change this status
    let isParent = this.options.isParent(data);
    let nextParentData = isParent ? data : parentData;

    const ignore = this.options.isIgnored(data);

    if (!ignore && typeof data !== "undefined") {
      const type = this.options.fields.getType(data);
      const id = this.options.fields.getId(data);
      data[this.options.fields.type] = type;
      data[this.options.fields.id] = id;

      const writableData = { ...data };
      this.options.fields.strip().forEach((stripField) => {
        delete writableData[stripField];
      });

      if (this.graph.hasNode(id)) {
        const oldNodeData = this.graph.getNodeData(id);
        const newNodeData = { ...writableData, ...oldNodeData };

        // update parent info
        isParent = this.options.isParent(writableData);
        nextParentData = isParent ? newNodeData : parentData;

        beforeLog(`updating data for ${id}`);
        this.graph.setNodeData(id, newNodeData);
        log(`updated data for ${id}`);
      } else {
        beforeLog(`adding node ${id}`);
        this.graph.addNode(id, writableData);
        log(`added node ${id}`);
      }

      if (!isParent) {
        const parentId = this.options.fields.getId(parentData);
        beforeLog(`${id} will depend on ${parentId}`);
        this.graph.addDependency(id, parentId);
        log(`${id} depends on ${parentId}`);
      }
    }

    if (Array.isArray(data)) {
      data.forEach((d) => this.walkAndBuildInternal(d, nextParentData));
    } else if (typeof data === "object") {
      for (const key in data) {
        const v = data[key];
        this.walkAndBuildInternal(v, nextParentData);
      }
    }
  }
}

export type TreeResult<TData> = {
  _data: TData;
  children?: TreeResult<TData>;
}[];

export const toTree = <TData>(
  graph: DepGraph<TData>,
  root?: string
): TreeResult<TData> => {
  if (!root) {
    return graph.overallOrder(true).map((next) => {
      return {
        _data: graph.getNodeData(next),
        children: toTree(graph, next),
      };
    });
  } else {
    return graph.directDependantsOf(root).map((next) => {
      return {
        _data: graph.getNodeData(next),
        children: toTree(graph, next),
      };
    });
  }
};
