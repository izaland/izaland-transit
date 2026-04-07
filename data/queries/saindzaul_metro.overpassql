// Saindzaul Metro Network (OpenGeoFiction)
// Endpoint: https://overpass.opengeofiction.net/api/interpreter

[out:json][timeout:60];
(
  // Metro lines in Saindzaul area
  relation["route"="subway"](35,-80,40,-74);
  // Metro stations
  node["station"="subway"](35,-80,40,-74);
  node["railway"="station"]["subway"="yes"](35,-80,40,-74);
);
out body;
>;
out skel qt;
