/* Traveling — spinnable globe (countries) + US states map.
   Depends on d3 v7 + topojson-client (loaded via CDN in traveling.html). */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var canvas = document.getElementById("globe");
  var fallback = document.getElementById("globe-fallback");
  if (!canvas || !window.d3 || !window.topojson) { if (fallback) fallback.hidden = false; return; }
  var stage = canvas.closest(".globe-stage");

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
    { name: "Hawaii",       lon: -156.3,  lat: 20.8,  flag: "🌺" },
    { name: "Bora Bora",    lon: -151.7,  lat: -16.5, flag: "🌴" },
    { name: "Tahiti",       lon: -149.4,  lat: -17.7, flag: "🌴" },
    { name: "Singapore",    lon: 103.8,   lat: 1.35,  iso: "SG" },
    { name: "Hong Kong",    lon: 114.17,  lat: 22.28, iso: "HK" },
    { name: "Vatican City", lon: 12.4534, lat: 41.9029, iso: "VA" }
  ];
  var VISITED_STATES = new Set(["Hawaii"]);

  function flagEmoji(iso2) {
    if (!iso2) return "🌍";
    return iso2.toUpperCase().replace(/./g, function (c) { return String.fromCodePoint(127397 + c.charCodeAt(0)); });
  }
  var ISO = {
    "Spain": "ES", "Canada": "CA", "France": "FR", "Switzerland": "CH", "Vietnam": "VN",
    "China": "CN", "India": "IN", "Mexico": "MX", "United Kingdom": "GB", "Italy": "IT",
    "Japan": "JP", "Australia": "AU", "Turkey": "TR", "United States of America": "US"
  };
  var BLURB = {
    "Spain": "Sunshine, tapas, and way too much walking. One of my favorite trips so far.",
    "Canada": "Mountains, rivers, and where that hero photo up top was taken.",
    "France": "Croissants for breakfast, museums all day. Worth the jet lag.",
    "Switzerland": "The mountains looked fake. Like, video-game fake.",
    "Vietnam": "Incredible food — I'm still thinking about it.",
    "China": "Huge cities, ancient stuff right next to skyscrapers. Wild contrast.",
    "India": "Colors, food, and family — always a good trip.",
    "Mexico": "Beaches, tacos, and perfect weather. 10/10.",
    "United Kingdom": "Rainy but I loved it anyway. London's a lot to take in.",
    "Italy": "Ate pasta in basically every city. No regrets.",
    "Japan": "Trains that are never late and vending machines everywhere. Amazing.",
    "Australia": "Long flight, but the beaches made it worth it.",
    "Turkey": "History everywhere you look — and the food was unreal.",
    "United States of America": "Home base — but I've still got states left to hit.",
    "Hawaii": "Beaches, volcanoes, and way too much shave ice.",
    "Bora Bora": "The water is an unreal shade of blue. Like a screensaver.",
    "Tahiti": "Quiet, tropical, and a great stop on a big trip.",
    "Singapore": "Spotless, futuristic, and the food courts are next level.",
    "Hong Kong": "Skyscrapers and mountains in the same photo. So good.",
    "Vatican City": "The smallest country in the world — and I've actually been there."
  };
  var NOT_VISITED = [
    "Haven't made it here — yet. Adding it to the list.",
    "Not visited (yet). Might be my next trip!",
    "Still on the bucket list — I'll get there eventually.",
    "Haven't been, but it looks incredible. One day."
  ];

  var ctx = canvas.getContext("2d");
  var size = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var baseScale = 0, zoomK = 1, ZMIN = 1, ZMAX = 4.5;
  var projection = d3.geoOrthographic().rotate([-10, -18]).clipAngle(90);
  var path = d3.geoPath(projection, ctx);
  var graticule = d3.geoGraticule10();
  var world = null, spinning = !reduce;
  var selected = null;   // { kind: "country"|"marker", key, name }
  var sidebarOpen = false;
  var hoverKey = null;

  function applyScale() {
    projection.scale(baseScale * zoomK);
    render();
  }

  function resize() {
    size = canvas.clientWidth || 480;
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    baseScale = size / 2 - 2;
    projection.translate([size / 2, size / 2]);
    applyScale();
  }

  function frontMarkers() {
    var center = [-projection.rotate()[0], -projection.rotate()[1]];
    return MARKERS.filter(function (m) { return d3.geoDistance([m.lon, m.lat], center) <= Math.PI / 2; });
  }

  function render() {
    if (!size) return;
    ctx.clearRect(0, 0, size, size);
    ctx.beginPath(); path({ type: "Sphere" }); ctx.fillStyle = C.ocean; ctx.fill();
    ctx.beginPath(); path(graticule); ctx.strokeStyle = C.grat; ctx.lineWidth = 0.5; ctx.stroke();
    if (world) {
      world.features.forEach(function (f) {
        var name = f.properties.name;
        var isSel = selected && selected.kind === "country" && selected.key === name;
        var isHov = hoverKey === "c:" + name;
        ctx.beginPath(); path(f);
        ctx.fillStyle = isSel ? "#1f5ae0" : (VISITED.has(name) ? C.visited : (isHov ? "#c3c8d2" : C.land));
        ctx.fill();
        ctx.strokeStyle = isSel ? "#0d1b4d" : C.stroke; ctx.lineWidth = isSel ? 1.4 : 0.4; ctx.stroke();
      });
    }
    ctx.beginPath(); path({ type: "Sphere" }); ctx.strokeStyle = "rgba(20,22,30,.14)"; ctx.lineWidth = 1; ctx.stroke();
    frontMarkers().forEach(function (m) {
      var p = projection([m.lon, m.lat]);
      var isSel = selected && selected.kind === "marker" && selected.key === m.name;
      var isHov = hoverKey === "m:" + m.name;
      var r = isSel ? 6.5 : (isHov ? 5.5 : 4.5);
      ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 2 * Math.PI);
      ctx.fillStyle = isSel ? "#0d1b4d" : C.marker; ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.8; ctx.stroke();
    });
  }

  /* ---------- Hit testing ---------- */
  function hitTest(mx, my) {
    var mk = frontMarkers();
    for (var i = 0; i < mk.length; i++) {
      var p = projection([mk[i].lon, mk[i].lat]);
      if (Math.hypot(p[0] - mx, p[1] - my) <= 10) return { kind: "marker", key: mk[i].name, name: mk[i].name, def: mk[i] };
    }
    var lonlat = projection.invert([mx, my]);
    if (!lonlat) return null;
    var back = d3.geoDistance(lonlat, [-projection.rotate()[0], -projection.rotate()[1]]) > Math.PI / 2;
    if (back || !world) return null;
    for (var j = 0; j < world.features.length; j++) {
      var f = world.features[j];
      if (d3.geoContains(f, lonlat)) return { kind: "country", key: f.properties.name, name: f.properties.name, def: f };
    }
    return null;
  }

  /* ---------- Tooltip ---------- */
  var tip = document.createElement("div");
  tip.className = "globe-tip";
  tip.innerHTML = '<span class="globe-tip__flag"></span><span class="globe-tip__name"></span><span class="globe-tip__tag"></span>';
  if (stage) stage.appendChild(tip);
  var tipFlag = tip.querySelector(".globe-tip__flag"), tipName = tip.querySelector(".globe-tip__name"), tipTag = tip.querySelector(".globe-tip__tag");

  function showTip(hit, x, y) {
    var visited = hit.kind === "marker" ? true : VISITED.has(hit.key);
    tipFlag.textContent = hit.kind === "marker" ? (hit.def.flag || flagEmoji(hit.def.iso)) : flagEmoji(ISO[hit.key]);
    tipName.textContent = hit.name;
    tipTag.textContent = visited ? "Visited" : "Not yet";
    tipTag.className = "globe-tip__tag" + (visited ? "" : " no");
    tip.style.left = x + "px"; tip.style.top = y + "px";
    tip.classList.add("show");
  }
  function hideTip() { tip.classList.remove("show"); }

  /* ---------- Sidebar ---------- */
  var sideBackdrop = document.createElement("div"); sideBackdrop.className = "globe-sidebar-backdrop";
  var sidebar = document.createElement("aside"); sidebar.className = "globe-sidebar";
  sidebar.innerHTML =
    '<div class="globe-sidebar__hero">' +
      '<button class="globe-sidebar__close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg></button>' +
      '<div class="globe-sidebar__flag"></div>' +
      '<div class="globe-sidebar__name"></div>' +
      '<span class="globe-sidebar__badge"></span>' +
    '</div>' +
    '<div class="globe-sidebar__body"><p class="globe-sidebar__blurb"></p><div class="globe-sidebar__stat"></div></div>';
  document.body.appendChild(sideBackdrop); document.body.appendChild(sidebar);
  var sbFlag = sidebar.querySelector(".globe-sidebar__flag"), sbName = sidebar.querySelector(".globe-sidebar__name"),
      sbBadge = sidebar.querySelector(".globe-sidebar__badge"), sbBlurb = sidebar.querySelector(".globe-sidebar__blurb"),
      sbStat = sidebar.querySelector(".globe-sidebar__stat");

  function openSidebar(hit) {
    selected = { kind: hit.kind, key: hit.key };
    var visited = hit.kind === "marker" ? true : VISITED.has(hit.key);
    sbFlag.textContent = hit.kind === "marker" ? (hit.def.flag || flagEmoji(hit.def.iso)) : flagEmoji(ISO[hit.key]);
    sbName.textContent = hit.name;
    sbBadge.textContent = visited ? "Visited" : "Not visited";
    sbBadge.className = "globe-sidebar__badge" + (visited ? "" : " no");
    sbBlurb.textContent = visited ? (BLURB[hit.key] || "One of the places on the list. Great trip.") : NOT_VISITED[Math.floor(Math.random() * NOT_VISITED.length)];
    var TOTAL_STAMPS = 19; // matches the "stamps and counting" count on the page (excludes home country)
    sbStat.innerHTML = visited ? "Part of <b>" + TOTAL_STAMPS + "</b> stamps in the passport so far." : "<b>" + TOTAL_STAMPS + "</b> stamps so far — this one could be next.";
    sidebarOpen = true; spinning = false; hideTip();
    sideBackdrop.classList.add("open"); sidebar.classList.add("open");
    if (typeof Sound !== "undefined") Sound.whoosh();
    render();
  }
  function closeSidebar() {
    if (!sidebarOpen) return;
    sidebarOpen = false; selected = null;
    sideBackdrop.classList.remove("open"); sidebar.classList.remove("open");
    spinning = !reduce;
    render();
  }
  sidebar.querySelector(".globe-sidebar__close").addEventListener("click", closeSidebar);
  window.addEventListener("keydown", function (e) { if (e.key === "Escape") closeSidebar(); });
  document.addEventListener("click", function (e) {
    if (!sidebarOpen) return;
    if (stage && stage.contains(e.target)) return;   // clicks on the globe/zoom handled separately
    if (sidebar.contains(e.target)) return;
    closeSidebar();
  });

  /* ---------- Zoom ---------- */
  var zoomWrap = document.createElement("div"); zoomWrap.className = "globe-zoom";
  zoomWrap.innerHTML =
    '<button type="button" class="globe-zoom__in" aria-label="Zoom in"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M11 8v6M8 11h6M20 20l-3.5-3.5" stroke-linecap="round"/></svg></button>' +
    '<button type="button" class="globe-zoom__out" aria-label="Zoom out"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M8 11h6M20 20l-3.5-3.5" stroke-linecap="round"/></svg></button>';
  if (stage) stage.appendChild(zoomWrap);
  function setZoom(k) { zoomK = Math.max(ZMIN, Math.min(ZMAX, k)); applyScale(); }
  zoomWrap.querySelector(".globe-zoom__in").addEventListener("click", function () { setZoom(zoomK * 1.35); });
  zoomWrap.querySelector(".globe-zoom__out").addEventListener("click", function () { setZoom(zoomK / 1.35); });
  canvas.addEventListener("wheel", function (e) {
    e.preventDefault();
    setZoom(zoomK * (e.deltaY < 0 ? 1.12 : 1 / 1.12));
  }, { passive: false });

  /* ---------- Drag to spin + click to select ---------- */
  var dragDist = 0;
  d3.select(canvas).call(
    d3.drag()
      .on("start", function () { spinning = false; dragDist = 0; })
      .on("drag", function (event) {
        dragDist += Math.abs(event.dx) + Math.abs(event.dy);
        var k = 0.4, r = projection.rotate();
        projection.rotate([r[0] + event.dx * k, Math.max(-90, Math.min(90, r[1] - event.dy * k))]);
        render();
      })
      .on("end", function (event) {
        if (dragDist < 4) {
          var rect = canvas.getBoundingClientRect();
          var mx = (event.sourceEvent.clientX - rect.left) * (size / rect.width);
          var my = (event.sourceEvent.clientY - rect.top) * (size / rect.height);
          var hit = hitTest(mx, my);
          if (hit) openSidebar(hit);
        }
        spinning = !reduce && !sidebarOpen;
      })
  );

  // Hover tooltip (throttled to animation frames)
  var pendingHover = null, hoverQueued = false;
  canvas.addEventListener("pointermove", function (e) {
    var rect = canvas.getBoundingClientRect();
    pendingHover = {
      mx: (e.clientX - rect.left) * (size / rect.width),
      my: (e.clientY - rect.top) * (size / rect.height),
      x: e.clientX - rect.left, y: e.clientY - rect.top
    };
    if (hoverQueued) return;
    hoverQueued = true;
    requestAnimationFrame(function () {
      hoverQueued = false;
      if (!pendingHover) return;
      var hit = hitTest(pendingHover.mx, pendingHover.my);
      var key = hit ? (hit.kind === "marker" ? "m:" : "c:") + hit.key : null;
      if (key !== hoverKey) { hoverKey = key; render(); }
      if (hit) { showTip(hit, pendingHover.x, pendingHover.y); canvas.style.cursor = "pointer"; }
      else { hideTip(); canvas.style.cursor = "grab"; }
    });
  });
  canvas.addEventListener("pointerleave", function () { hoverKey = null; hideTip(); render(); });

  // Auto-spin
  d3.timer(function () {
    if (!spinning || sidebarOpen) return;
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
