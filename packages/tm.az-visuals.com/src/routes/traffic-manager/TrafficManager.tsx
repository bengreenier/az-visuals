import { DepGraph } from "dependency-graph";
import React, {
  ChangeEvent,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthWrapperContext } from "../../Auth";
import {
  DEFAULT_NODE_CIRCLE_RADIUS,
  loadGraph,
  loadGraphExternal,
  parseMatcherParam,
  textLayout,
  BooleanAttribute,
  DataAttributes,
  determinePathClass,
  GraphData,
  toTree,
} from "./util";
import { useLocalStorage, useQuery } from "../router-utils";
import { useHistory, useParams } from "react-router-dom";
import {
  CustomNodeElementProps,
  RawNodeDatum,
} from "react-d3-tree/lib/types/common";
import Tree from "react-d3-tree";
import "./TrafficManager.css";
import { ApiType, RuntimeManifest } from "../../types";

/**
 * Route parameter name for subscription property
 */
export const subscriptionParam = "subscription";

/**
 * Route parameter name for  traffic manager property
 */
export const trafficManagerParam = "trafficManager";

/**
 * Properties for the traffic manager data component
 */
interface TrafficManagerDataProps {
  /**
   * The api type to use
   */
  type: ApiType;

  /**
   * Optional url, used when type == ApiType.Custom @see ApiType
   */
  url?: string;

  /**
   * portal hostname format to use
   */
  portalHostname: RuntimeManifest["portalHostname"];

  /**
   * A subscription filter value to limit subscriptions
   */
  subscriptionFilter: RegExp;

  /**
   * A traffic manager filter value to limit traffic managers
   */
  trafficManagerFilter: RegExp;
}

/**
 * Properties for the top-level page component
 */
export interface TrafficManagerPageProps {
  /**
   * Information about the api to use
   */
  api: Pick<TrafficManagerDataProps, "type"> &
    Pick<TrafficManagerDataProps, "url">;

  /**
   * portal hostname format to use
   */
  portalHostname: RuntimeManifest["portalHostname"];
}

/**
 * Parameters loaded from the url route
 */
interface PageParams {
  /**
   * subscription filter value
   */
  subscription: string;

  /**
   * traffic manager filter value
   */
  trafficManager: string;
}

/**
 * Top-level page component for traffic manager visualization
 * @param props properties
 * @returns react component
 */
export const TrafficManagerPage = (props: TrafficManagerPageProps) => {
  const { subscription, trafficManager } = useParams<PageParams>();
  const [showIndex, setShowIndex] = useLocalStorage(
    "az-visuals.tm.landing-page",
    "true"
  );
  const subscriptionMatcher = parseMatcherParam(subscription);
  const trafficManagerMatcher = parseMatcherParam(trafficManager);

  // render a full page div wil the data element
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {showIndex === "true" ? (
        <IndexPage onReady={() => setShowIndex("false")} />
      ) : (
        <TrafficManagerData
          portalHostname={props.portalHostname}
          subscriptionFilter={subscriptionMatcher}
          trafficManagerFilter={trafficManagerMatcher}
          {...props.api}
        />
      )}
    </div>
  );
};

/**
 * Index page component to display prior to authentication.
 * @param props properties
 * @returns React component
 */
export const IndexPage = (
  props: PropsWithChildren<{ onReady: () => void }>
) => {
  return (
    <div style={{ textAlign: "center" }}>
      <h1>Traffic Manager Visualizer</h1>
      <h2>A tool to inspect complex traffic manager hierarchies</h2>
      <h4>Options:</h4>
      <ul style={{ listStyle: "none" }}>
        <li>
          <p>
            Limit subscriptions with{" "}
            <span
              style={{
                backgroundColor: "rgba(27,31,35,0.05)",
                borderRadius: "6px",
                color: "#2C7BB6",
              }}
            >
              /subscriptions/&lt;subscriptionRegex&gt;/
            </span>{" "}
          </p>
        </li>
        <li>
          <p>
            Limit traffic managers with{" "}
            <span
              style={{
                backgroundColor: "rgba(27,31,35,0.05)",
                borderRadius: "6px",
                color: "#D7191C",
              }}
            >
              /traffic-managers/&lt;trafficManagerRegex&gt;/
            </span>{" "}
          </p>
        </li>
        <li>
          <p>
            Visualize a specific hierarchy root with{" "}
            <span
              style={{
                backgroundColor: "rgba(27,31,35,0.05)",
                borderRadius: "6px",
                color: "#8C52FC",
              }}
            >
              /?root=/full/path/to/root/tm
            </span>{" "}
          </p>
        </li>
        <li>
          <p>
            For example:
            <br />
            <span
              style={{
                backgroundColor: "rgba(27,31,35,0.05)",
                borderRadius: "6px",
              }}
            >
              /#/subscriptions/
              <span style={{ color: "#2C7BB6" }}>
                94738bcd-b366-4610-8e4e-004d8fab4161
              </span>
              /traffic-managers/<span style={{ color: "#D7191C" }}>all</span>
              ?root=
              <span style={{ color: "#8C52FC" }}>
                /subscriptions/94738bcd-b366-4610-8e4e-004d8fab4161/resourceGroups/tntviz-test/providers/Microsoft.Network/trafficManagerProfiles/prd-toplevel
              </span>
            </span>{" "}
          </p>
        </li>
        <li>
          <p>
            ... or append{" "}
            <span
              style={{
                backgroundColor: "rgba(27,31,35,0.05)",
                borderRadius: "6px",
              }}
            >
              ?token=&lt;yourToken&gt;
            </span>{" "}
            to the url, to use a custom token for authentication - and refresh
            the page.
          </p>
        </li>
      </ul>
      <button onClick={props.onReady}>Begin</button>
    </div>
  );
};

/**
 * Data management component including querying and filtering of data
 * @param props properties
 * @returns react component
 */
const TrafficManagerData = (props: TrafficManagerDataProps) => {
  const {
    type,
    url,
    subscriptionFilter,
    trafficManagerFilter,
    portalHostname,
  } = props;
  const ctx = useContext(AuthWrapperContext);
  const { credentials } = ctx;
  const query = useQuery();
  const history = useHistory();
  const [graph, setGraph] = useState<DepGraph<GraphData>>();
  const [graphRoots, setGraphRoots] = useState<string[]>([]);

  const [activeRoot, setActiveRoot] = useState<string>();

  const root = query.get("root") ?? "first";

  // helper to find the best graph root
  const getNewGraphRoot = useCallback(() => {
    return () => {
      return graphRoots.find((r) => r === root) ?? graphRoots[0];
    };
  }, [root, graphRoots]);

  // load the data
  useEffect(() => {
    if (type === ApiType.Azure) {
      loadGraph(credentials, subscriptionFilter, trafficManagerFilter).then(
        (data) => {
          setGraph(data);
        }
      );
    } else if (type === ApiType.Custom) {
      loadGraphExternal(url).then((data) => {
        setGraph(data);
      });
    }
  }, [type, url, credentials, subscriptionFilter, trafficManagerFilter]);

  // when the grap is populated, pull out the roots
  useEffect(() => {
    if (graph) {
      const rootIds = graph.overallOrder(true);
      setGraphRoots(rootIds);
    }
  }, [graph]);

  // when the roots are populated, set the active root
  useEffect(() => {
    if (graphRoots.length > 0) {
      const desiredRoot = getNewGraphRoot();

      setActiveRoot(desiredRoot);
    }
  }, [graphRoots, root, getNewGraphRoot]);

  // when the active root is set, update the url
  useEffect(() => {
    if (activeRoot) {
      history.replace({
        ...history.location,
        search: `?root=${activeRoot}`,
      });
    }
  }, [activeRoot, history]);

  // render the children views with this data
  return (
    <>
      {activeRoot ? (
        <TrafficManagerView
          tree={toTree(graph, activeRoot, portalHostname)}
          treeId={activeRoot}
          availableRoots={graphRoots}
          requestTree={(newRoot: string) => {
            setActiveRoot(newRoot);
          }}
        />
      ) : (
        <h1>Loading...</h1>
      )}
    </>
  );
};

/**
 * Properties for the @see TrafficManagerView
 */
interface TrafficManagerViewProps {
  /**
   * The tree to render
   */
  tree: RawNodeDatum;

  /**
   * The tree root id to render
   */
  treeId: string;

  /**
   * Set of available tree roots
   */
  availableRoots: string[];

  /**
   * request that a different tree root be rendered
   */
  requestTree: (tree: string) => void;
}

/**
 * Interface to define a select dropdown option.
 */
interface selectOption {
  /**
   * The label value
   */
  label: string;

  /**
   * The value value
   */
  value: string;
}

/**
 * View component including root selection mechanisms
 * @param props properties
 * @returns react component
 */
const TrafficManagerView = (props: TrafficManagerViewProps) => {
  const { tree, treeId, availableRoots, requestTree } = props;
  const [selectOptions, setSelectOptions] = useState<selectOption[]>([]);

  // render a selector of all available roots
  useEffect(() => {
    setSelectOptions(availableRoots.map((t) => ({ label: t, value: t })));
  }, [availableRoots]);

  // handler for selection change
  const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    requestTree(e.currentTarget.value);
  };

  // render the selector and tree inside a flexbox
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        height: "100vh",
        border: "2px solid #777",
        borderBottomWidth: "0px",
        borderTopWidth: "0px",
      }}
    >
      <select value={treeId} onChange={onSelectChange}>
        {selectOptions.map(({ label, value }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {tree && <TrafficManagerTree tree={tree} />}
    </div>
  );
};

/**
 * Tree renderer component
 * @param props properties
 * @returns react component
 */
const TrafficManagerTree = (props: Pick<TrafficManagerViewProps, "tree">) => {
  // render the tree, using our custom node element
  return (
    <Tree
      data={props.tree}
      orientation={"vertical"}
      depthFactor={500}
      nodeSize={{ x: 400, y: 400 }}
      pathClassFunc={determinePathClass}
      renderCustomNodeElement={(props) => <TrafficManagerNode {...props} />}
    />
  );
};

/**
 * Custom tree node component
 * @param props properties
 * @returns react component
 */
const TrafficManagerNode: React.FunctionComponent<CustomNodeElementProps> = ({
  nodeDatum,
  toggleNode,
}) => {
  // pull out non-visual information
  const {
    activeAndEnabled,
    portalUrl,
    ...attrs
  } = nodeDatum.attributes as DataAttributes;

  // render the node, using non-visuals to control color, links
  return (
    <>
      <circle
        fill={
          activeAndEnabled === BooleanAttribute.True ? "#2C7BB6" : "#D7191C"
        }
        r={DEFAULT_NODE_CIRCLE_RADIUS}
        onClick={() => {
          toggleNode();
        }}
      ></circle>
      <g className="rd3t-label">
        <text
          className="rd3t-label__title"
          {...textLayout.title}
          onClick={() => {
            window.open(portalUrl, "_blank");
          }}
        >
          {nodeDatum.name}
        </text>
        <text className="rd3t-label__attributes">
          {attrs &&
            Object.entries(attrs).map(([labelKey, labelValue], i) => (
              <tspan key={`${labelKey}-${i}`} {...textLayout.attribute}>
                {labelKey}: {labelValue}
              </tspan>
            ))}
        </text>
      </g>
    </>
  );
};
