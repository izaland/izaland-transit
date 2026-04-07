// IZX High-Speed Rail lines in Izaland (OpenGeoFiction)
// Endpoint: https://overpass.opengeofiction.net/api/interpreter
// Usage: paste in https://overpass.opengeofiction.net/

[out:json][timeout:60];
(
  // IZX lines (high_speed railways)
  relation["route"="train"]["network"="IZX"]({{bbox}});
  way["railway"="rail"]["usage"="main"]["highspeed"="yes"]({{bbox}});
  // IZX stations
  node["railway"="station"]["network"="IZX"]({{bbox}});
);
out body;
>;
out skel qt;
