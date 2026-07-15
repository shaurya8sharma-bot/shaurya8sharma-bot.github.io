/* Traveling — spinnable globe (countries) + US states map.
   Depends on d3 v7 + topojson-client (loaded via CDN in traveling.html). */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var canvas = document.getElementById("globe");
  var fallback = document.getElementById("globe-fallback");
  if (!canvas || !window.d3 || !window.topojson) { if (fallback) fallback.hidden = false; return; }

  // Colors (match the site palette)
  var C = { ocean: "#e7ebf1", land: "#d3d8e0", visited: "#2f6bff", stroke: "#f3f4f6", marker: "#f5402c", grat: "rgba(20,22,30,.06)" };

  // Countries you've been to (names as in world-atlas)
  var VISITED = new Set([
    "Spain", "Canada", "France", "Switzerland", "Vietnam", "China",
    "India", "Mexico", "United Kingdom", "Italy", "Japan", "Australia", "Turkey",
    "United States of America"
  ]);
  // Island / city-state spots shown as pins (too small to fill at this scale)
  var MARKERS = [
    { name: "Hawaii",     lon: -156.3, lat: 20.8 },
    { name: "Bora Bora",  lon: -151.7, lat: -16.5 },
    { name: "Tahiti",     lon: -149.4, lat: -17.7 },
    { name: "Singapore",  lon: 103.8,  lat: 1.35 },
    { name: "Hong Kong",  lon: 114.17, lat: 22.28 }
  ];
  var VISITED_STATES = new Set(["Hawaii"]);

  var ctx = canvas.getContext("2d");
  var size = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var projection = d3.geoOrthographic().rotate([-10, -18]).clipAngle(90);
  var path = d3.geoPath(projection, ctx);
  var graticule = d3.geoGraticule10();
  var world = null, spinning = !reduce;

  function resize() {
    size = canvas.clientWidth || 480;
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    projection.scale(size / 2 - 2).translate([size / 2, size / 2]);
    render();
  }

  function render() {
    if (!size) return;
    ctx.clearRect(0, 0, size, size);
    // ocean
    ctx.beginPath(); path({ type: "Sphere" }); ctx.fillStyle = C.ocean; ctx.fill();
    // graticule
    ctx.beginPath(); path(graticule); ctx.strokeStyle = C.grat; ctx.lineWidth = 0.5; ctx.stroke();
    if (world) {
      world.features.forEach(function (f) {
        ctx.beginPath(); path(f);
        ctx.fillStyle = VISITED.has(f.properties.name) ? C.visited : C.land;
        ctx.fill();
        ctx.strokeStyle = C.stroke; ctx.lineWidth = 0.4; ctx.stroke();
      });
    }
    // rim
    ctx.beginPath(); path({ type: "Sphere" }); ctx.strokeStyle = "rgba(20,22,30,.14)"; ctx.lineWidth = 1; ctx.stroke();
    // island markers (only front hemisphere)
    var center = [-projection.rotate()[0], -projection.rotate()[1]];
    MARKERS.forEach(function (m) {
      if (d3.geoDistance([m.lon, m.lat], center) > Math.PI / 2) return;
      var p = projection([m.lon, m.lat]);
      ctx.beginPath(); ctx.arc(p[0], p[1], 4.5, 0, 2 * Math.PI);
      ctx.fillStyle = C.marker; ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.8; ctx.stroke();
    });
  }

  // Drag to spin
  d3.select(canvas).call(
    d3.drag()
      .on("start", function () { spinning = false; })
      .on("drag", function (event) {
        var k = 0.4, r = projection.rotate();
        projection.rotate([r[0] + event.dx * k, Math.max(-90, Math.min(90, r[1] - event.dy * k))]);
        render();
      })
      .on("end", function () { spinning = !reduce; })
  );

  // Auto-spin
  d3.timer(function () {
    if (!spinning) return;
    var r = projection.rotate();
    projection.rotate([r[0] + 0.16, r[1]]);
    render();
  });

  window.addEventListener("resize", resize);

  // Load world + US data
  Promise.all([
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json")
  ]).then(function (data) {
    world = topojson.feature(data[0], data[0].objects.countries);
    resize();
    // US states map
    var usTopo = data[1];
    var states = topojson.feature(usTopo, usTopo.objects.states).features;
    var usPath = d3.geoPath(); // states-10m is pre-projected to 975x610
    var svg = d3.select("#usmap");
    if (!svg.empty()) {
      svg.selectAll("path").data(states).join("path")
        .attr("d", usPath)
        .attr("class", function (d) { return VISITED_STATES.has(d.properties.name) ? "visited" : ""; })
        .append("title").text(function (d) { return d.properties.name; });
    }
  }).catch(function () {
    if (fallback) fallback.hidden = false;
    canvas.style.display = "none";
    resize();
  });
})();
