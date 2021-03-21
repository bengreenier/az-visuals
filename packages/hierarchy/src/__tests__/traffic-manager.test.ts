import { Endpoint, Profile } from "@azure/arm-trafficmanager/esm/models";
import { graph } from "../";

describe("graph.TrafficManager", () => {
  const testData: Profile[] = [
    {
      id:
        "/subscriptions/94738bcd-b366-4610-8e4e-004d8fab4161/resourceGroups/tntviz-test/providers/Microsoft.Network/trafficManagerProfiles/01-prd-toplevel",
      name: "01-prd-toplevel",
      type: "Microsoft.Network/trafficManagerProfiles",
      location: "global",
      tags: {},
      profileStatus: "Enabled",
      trafficRoutingMethod: "Performance",
      dnsConfig: {
        relativeName: "01.prd-toplevel",
        fqdn: "01.prd-toplevel.trafficmanager.net",
        ttl: 60,
      },
      monitorConfig: {
        profileMonitorStatus: "Inactive",
        protocol: "HTTP",
        port: 80,
        path: "/",
        intervalInSeconds: 30,
        toleratedNumberOfFailures: 3,
        timeoutInSeconds: 10,
      },
      endpoints: [],
      trafficViewEnrollmentStatus: "Disabled",
    },
    {
      id:
        "/subscriptions/94738bcd-b366-4610-8e4e-004d8fab4161/resourceGroups/tntviz-test/providers/Microsoft.Network/trafficManagerProfiles/02-prd-toplevel",
      name: "02-prd-toplevel",
      type: "Microsoft.Network/trafficManagerProfiles",
      location: "global",
      tags: {},
      profileStatus: "Enabled",
      trafficRoutingMethod: "Performance",
      dnsConfig: {
        relativeName: "02.prd-toplevel",
        fqdn: "02.prd-toplevel.trafficmanager.net",
        ttl: 60,
      },
      monitorConfig: {
        profileMonitorStatus: "Degraded",
        protocol: "HTTP",
        port: 80,
        path: "/",
        intervalInSeconds: 30,
        toleratedNumberOfFailures: 3,
        timeoutInSeconds: 10,
      },
      endpoints: [
        {
          id:
            "/subscriptions/94738bcd-b366-4610-8e4e-004d8fab4161/resourceGroups/tntviz-test/providers/Microsoft.Network/trafficManagerProfiles/02-prd-toplevel/azureEndpoints/test1",
          name: "test1",
          type: "Microsoft.Network/trafficManagerProfiles/azureEndpoints",
          endpointStatus: "Enabled",
          endpointMonitorStatus: "Online",
          targetResourceId:
            "/subscriptions/94738bcd-b366-4610-8e4e-004d8fab4161/resourceGroups/tntviz-test/providers/Microsoft.Web/sites/test234t132t433t43t23",
          target: "test234t132t433t43t23.azurewebsites.net",
          weight: 1,
          priority: 1,
          endpointLocation: "Central US",
        },
        {
          id:
            "/subscriptions/94738bcd-b366-4610-8e4e-004d8fab4161/resourceGroups/tntviz-test/providers/Microsoft.Network/trafficManagerProfiles/02-prd-toplevel/externalEndpoints/bengreenier.com",
          name: "bengreenier.com",
          type: "Microsoft.Network/trafficManagerProfiles/externalEndpoints",
          endpointStatus: "Enabled",
          endpointMonitorStatus: "Degraded",
          target: "bengreenier.com",
          weight: 1,
          priority: 2,
          endpointLocation: "East US",
        },
      ],
      trafficViewEnrollmentStatus: "Disabled",
    },
    {
      id:
        "/subscriptions/94738bcd-b366-4610-8e4e-004d8fab4161/resourceGroups/tntviz-test/providers/Microsoft.Network/trafficManagerProfiles/geo-test-abc-123",
      name: "geo-test-abc-123",
      type: "Microsoft.Network/trafficManagerProfiles",
      location: "global",
      tags: {},
      profileStatus: "Enabled",
      trafficRoutingMethod: "Geographic",
      dnsConfig: {
        relativeName: "geo-test-abc-123",
        fqdn: "geo-test-abc-123.trafficmanager.net",
        ttl: 60,
      },
      monitorConfig: {
        profileMonitorStatus: "Degraded",
        protocol: "HTTP",
        port: 80,
        path: "/",
        intervalInSeconds: 30,
        toleratedNumberOfFailures: 3,
        timeoutInSeconds: 10,
      },
      endpoints: [
        {
          id:
            "/subscriptions/94738bcd-b366-4610-8e4e-004d8fab4161/resourceGroups/tntviz-test/providers/Microsoft.Network/trafficManagerProfiles/geo-test-abc-123/externalEndpoints/test1",
          name: "test1",
          type: "Microsoft.Network/trafficManagerProfiles/externalEndpoints",
          endpointStatus: "Enabled",
          endpointMonitorStatus: "Degraded",
          target: "test1.bengreenier.com",
          weight: 1,
          priority: 1,
          geoMapping: ["WORLD", "BW"],
        },
      ],
      trafficViewEnrollmentStatus: "Disabled",
    },
    {
      id:
        "/subscriptions/94738bcd-b366-4610-8e4e-004d8fab4161/resourceGroups/tntviz-test/providers/Microsoft.Network/trafficManagerProfiles/prd-toplevel",
      name: "prd-toplevel",
      type: "Microsoft.Network/trafficManagerProfiles",
      location: "global",
      tags: {},
      profileStatus: "Enabled",
      trafficRoutingMethod: "Performance",
      dnsConfig: {
        relativeName: "prd.toplevel",
        fqdn: "prd.toplevel.trafficmanager.net",
        ttl: 60,
      },
      monitorConfig: {
        profileMonitorStatus: "Online",
        protocol: "HTTP",
        port: 80,
        path: "/",
        intervalInSeconds: 30,
        toleratedNumberOfFailures: 3,
        timeoutInSeconds: 10,
      },
      endpoints: [
        {
          id:
            "/subscriptions/94738bcd-b366-4610-8e4e-004d8fab4161/resourceGroups/tntviz-test/providers/Microsoft.Network/trafficManagerProfiles/prd-toplevel/nestedEndpoints/01-prd-toplevel",
          name: "01-prd-toplevel",
          type: "Microsoft.Network/trafficManagerProfiles/nestedEndpoints",
          endpointStatus: "Enabled",
          endpointMonitorStatus: "Stopped",
          targetResourceId:
            "/subscriptions/94738bcd-b366-4610-8e4e-004d8fab4161/resourceGroups/tntviz-test/providers/Microsoft.Network/trafficManagerProfiles/01-prd-toplevel",
          target: "01.prd-toplevel.trafficmanager.net",
          weight: 1,
          priority: 1,
          endpointLocation: "East Asia",
          minChildEndpoints: 1,
        },
        {
          id:
            "/subscriptions/94738bcd-b366-4610-8e4e-004d8fab4161/resourceGroups/tntviz-test/providers/Microsoft.Network/trafficManagerProfiles/prd-toplevel/nestedEndpoints/02.prd-toplevel",
          name: "02.prd-toplevel",
          type: "Microsoft.Network/trafficManagerProfiles/nestedEndpoints",
          endpointStatus: "Enabled",
          endpointMonitorStatus: "Online",
          targetResourceId:
            "/subscriptions/94738bcd-b366-4610-8e4e-004d8fab4161/resourceGroups/tntviz-test/providers/Microsoft.Network/trafficManagerProfiles/02-prd-toplevel",
          target: "02.prd-toplevel.trafficmanager.net",
          weight: 1,
          priority: 2,
          endpointLocation: "North Europe",
          minChildEndpoints: 1,
        },
      ],
      trafficViewEnrollmentStatus: "Disabled",
    },
    {
      id:
        "/subscriptions/94738bcd-b366-4610-8e4e-004d8fab4161/resourceGroups/tntviz-test/providers/Microsoft.Network/trafficManagerProfiles/psplit",
      name: "psplit",
      type: "Microsoft.Network/trafficManagerProfiles",
      location: "global",
      tags: {},
      profileStatus: "Enabled",
      trafficRoutingMethod: "Priority",
      dnsConfig: {
        relativeName: "psplit",
        fqdn: "psplit.trafficmanager.net",
        ttl: 60,
      },
      monitorConfig: {
        profileMonitorStatus: "Inactive",
        protocol: "HTTP",
        port: 80,
        path: "/",
        intervalInSeconds: 30,
        toleratedNumberOfFailures: 3,
        timeoutInSeconds: 10,
      },
      endpoints: [],
      trafficViewEnrollmentStatus: "Disabled",
    },
    {
      id:
        "/subscriptions/94738bcd-b366-4610-8e4e-004d8fab4161/resourceGroups/tntviz-test/providers/Microsoft.Network/trafficManagerProfiles/wsplit",
      name: "wsplit",
      type: "Microsoft.Network/trafficManagerProfiles",
      location: "global",
      tags: {},
      profileStatus: "Enabled",
      trafficRoutingMethod: "Weighted",
      dnsConfig: {
        relativeName: "wsplit",
        fqdn: "wsplit.trafficmanager.net",
        ttl: 60,
      },
      monitorConfig: {
        profileMonitorStatus: "Inactive",
        protocol: "HTTP",
        port: 80,
        path: "/",
        intervalInSeconds: 30,
        toleratedNumberOfFailures: 3,
        timeoutInSeconds: 10,
      },
      endpoints: [],
      trafficViewEnrollmentStatus: "Disabled",
    },
  ];

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

  it("should graph properly", () => {
    const walker = new graph.Walker<Profile & Endpoint>(
      trafficManagerWalkerOpts
    );
    const tree = walker.walkAndBuild(testData);

    expect(graph.toTree(tree)).toMatchSnapshot();
  });
});
