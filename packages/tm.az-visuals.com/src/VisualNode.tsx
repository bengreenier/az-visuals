import { CustomNodeElementProps } from "react-d3-tree/lib/types/common";

import { DataAttributes, EnabledAttribute } from "./VisualUtils";

const DEFAULT_NODE_CIRCLE_RADIUS = 15;
const textLayout = {
  title: {
    textAnchor: "start",
    x: 40,
  },
  attribute: {
    x: 40,
    dy: "1.2em",
  },
};

const VisualNode: React.FunctionComponent<CustomNodeElementProps> = ({
  nodeDatum,
  toggleNode,
}) => {
  const { enabled } = nodeDatum.attributes as DataAttributes;
  return (
    <>
      <circle
        fill={enabled === EnabledAttribute.Enabled ? "green" : "red"}
        r={DEFAULT_NODE_CIRCLE_RADIUS}
        onClick={() => {
          toggleNode();
        }}
      ></circle>
      <g className="rd3t-label">
        <text className="rd3t-label__title" {...textLayout.title}>
          {nodeDatum.name}
        </text>
        <text className="rd3t-label__attributes">
          {nodeDatum.attributes &&
            Object.entries(nodeDatum.attributes).map(
              ([labelKey, labelValue], i) => (
                <tspan key={`${labelKey}-${i}`} {...textLayout.attribute}>
                  {labelKey}: {labelValue}
                </tspan>
              )
            )}
        </text>
      </g>
    </>
  );
};

export const renderVisualNode = (props: CustomNodeElementProps) => {
  return <VisualNode {...props} />;
};
