import { PropsWithChildren } from "react";

/**
 * @see IndexPage component properties
 */
interface Props {
    /**
     * The on click action for the 'Authenticate' button
     */
    onClick: () => void
}

/**
 * Index page component to display prior to authentication.
 * @param props properties
 * @returns React component
 */
export const IndexPage = (props: PropsWithChildren<Props>) => {
  return (
    <div style={{ textAlign: "center" }}>
      <h1>Traffic Manager Visualizer</h1>
      <h2>A tool to inspect complex traffic manager hierarchies</h2>
      <button onClick={props.onClick}>Authenticate via AAD</button>
      <p>
        ... or append{" "}
        <span style={{ backgroundColor: "rgba(27,31,35,0.05)", borderRadius: "6px" }}>
          ?token=&lt;yourToken&gt;
        </span>{" "}
        to the url, and refresh the page.
      </p>
    </div>
  );
};
