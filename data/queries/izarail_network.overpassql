// Full Izarail railway network (OpenGeoFiction)
// Endpoint: https://overpass.opengeofiction.net/api/interpreter
// Note: may be slow — filter by bbox or use specific relation IDs

[out:json][timeout:120];
(
  // Main line railways
  way["railway"="rail"]["operator"~"Izarail",i]({{bbox}});
  // All passenger train relations
  relation["route"="train"]["operator"~"Izarail",i]({{bbox}});
  // Stations
  node["railway"="station"]({{bbox}});
  node["railway"="halt"]({{bbox}});
);
out body;
>;
out skel qt;
