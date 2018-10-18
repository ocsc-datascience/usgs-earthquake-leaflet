var CA_Coordinates = [36.7783, -119.4179];
var mapZoomLevel = 6;

// color scale
function getColor(d) {
  return d > 8 ? '#800026' :
    d > 6 ? '#BD0026' :
      d > 5 ? '#E31A1C' :
        d > 4 ? '#FC4E2A' :
          d > 3 ? '#FD8D3C' :
            d > 2 ? '#FEB24C' :
              d > 1 ? '#FED976' :
                '#FFEDA0';
}

function createMap(earthquakes) {

  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var sat = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite": sat,
    "Street Map": streetmap,
    "Light": lightmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes
  };

  var map = L.map("map", {
    center: CA_Coordinates,
    zoom: mapZoomLevel,
    layers: [lightmap, earthquakes]
  });

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);

  // set up a legend

  var legend = L.control({ position: 'bottomleft' });

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
      grades = [0,1, 2, 3, 4, 6, 8],
      labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
  };

  legend.addTo(map);

}

function createFeatures(data) {

  var eqdata = data.features;

  // set up popup
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.title +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  function pointToLayer(feature, latlng) {
    var color, mag, radius;
    mag = feature.properties.mag;
    if (mag === null) {
      color = '#fff';
      radius = 2;
    } else {
      color = getColor(mag);
      radius = 2 * Math.max(mag, 1);
    }
    return L.circleMarker(latlng, {
      color: color,
      opacity: 1,
      fill: true,
      fillColor: color,
      fillOpacity: 0.5,
      stroke: true,
      weight: 2,
      radius: radius
    });
  }

  var earthquakes = L.geoJSON(eqdata, {
    onEachFeature: onEachFeature,
    pointToLayer: pointToLayer
  });

  createMap(earthquakes);

}


var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";
d3.json(url, createFeatures);

