# @az-visuals/hierarchy

Hierarchy utilities for azure visualizations.

## Getting started

```
import { graph } from "@az-visuals/hierarchy";
import { Endpoint, Profile } from "@azure/arm-trafficmanager/esm/models";

// create the walker options
const trafficManagerWalkerOpts: graph.WalkerOpts<Profile & Endpoint> = {
	isIgnored: (data) =>
		!(
		data.type === "Microsoft.Network/trafficManagerProfiles" ||
		data.type ===
			"Microsoft.Network/trafficManagerProfiles/nestedEndpoints" ||
		data.type ===
			"Microsoft.Network/trafficManagerProfiles/azureEndpoints" ||
		data.type ===
			"Microsoft.Network/trafficManagerProfiles/externalEndpoints"
		),
	isParent: (data) =>
		data.type === "Microsoft.Network/trafficManagerProfiles",
	fields: {
		id: "id",
		type: "type",
		getId: (data) =>
		((data as Endpoint)["targetResourceId"] as string) ??
		(data["id"] as string),
		getType: (data) => data.type as string,
		strip: () => ["endpoints", "tags"],
	},
};

// create the walker, with the options
const walker = new graph.Walker<Profile & Endpoint>(
	trafficManagerWalkerOpts
);

// build a dependency graph
const tree = walker.walkAndBuild(testData);

// serialize it
const ser = graph.toTree(tree);

// write it to json
console.log(JSON.stringify(ser));
```
