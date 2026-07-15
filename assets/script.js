/* Shaurya Sharma — Maker Portfolio · shared interactions */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Preloader (home) ---- */
  var pre = document.getElementById("preloader");
  if (pre) {
    var t0 = (window.performance && performance.now) ? performance.now() : Date.now();
    var minShow = reduce ? 0 : 700;
    var done = false;
    var dismiss = function () {
      if (done) return; done = true;
      pre.classList.add("is-done");
      document.body.classList.add("loaded");
      setTimeout(function () { if (pre.parentNode) pre.parentNode.removeChild(pre); }, 800);
    };
    window.addEventListener("load", function () {
      var now = (window.performance && performance.now) ? performance.now() : Date.now();
      setTimeout(dismiss, Math.max(0, minShow - (now - t0)));
    });
    setTimeout(dismiss, 4000); // safety net
  }

  /* ---- Header shadow on scroll ---- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Mobile nav ---- */
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav__toggle");
  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); });
    });
  }

  /* ---- Scroll reveal ---- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    var vh = function () { return window.innerHeight || document.documentElement.clientHeight; };
    reveals.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh() && r.bottom > 0) { el.classList.add("in"); } // already on screen: reveal now
      else { io.observe(el); }
    });
    // Safety net: after everything loads, reveal anything on-screen that slipped through.
    window.addEventListener("load", function () {
      document.querySelectorAll(".reveal:not(.in)").forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < vh() && r.bottom > 0) { el.classList.add("in"); io.unobserve(el); }
      });
    });
  }

  /* ---- Stat count-up ---- */
  if (!reduce && "IntersectionObserver" in window) {
    var nums = document.querySelectorAll("[data-count]");
    var run = function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      var dur = 1100, t0 = null;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { run(e.target); nio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { nio.observe(el); });
  }

  /* ---- Typing effect (hero eyebrow) ---- */
  var typer = document.querySelector(".typer");
  if (typer) {
    var words = (typer.getAttribute("data-words") || "").split(",")
      .map(function (w) { return w.trim(); }).filter(Boolean);
    if (words.length) {
      var caret = typer.parentNode.querySelector(".typer-caret");
      if (reduce) {
        typer.textContent = words[0];
      } else {
        var TYPE = 95, DEL = 45, HOLD = 1900, GAP = 380;
        var wi = 0, ci = 0, deleting = false;
        var solid = function (on) { if (caret) caret.classList.toggle("solid", on); };
        var tick = function () {
          var word = words[wi];
          if (!deleting) {
            ci++;
            typer.textContent = word.slice(0, ci);
            solid(true);
            if (ci === word.length) { deleting = true; solid(false); return setTimeout(tick, HOLD); }
            return setTimeout(tick, TYPE);
          }
          ci--;
          typer.textContent = word.slice(0, ci);
          solid(true);
          if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; solid(false); return setTimeout(tick, GAP); }
          return setTimeout(tick, DEL);
        };
        typer.textContent = "";
        setTimeout(tick, 600);
      }
    }
  }

  /* ---- Dark mode toggle ---- */
  (function () {
    var root = document.documentElement;
    var right = document.querySelector(".nav__right");
    if (!right) return;
    var btn = document.createElement("button");
    btn.className = "theme-toggle";
    btn.setAttribute("aria-label", "Toggle dark mode");
    btn.setAttribute("title", "Toggle theme");
    btn.innerHTML =
      '<svg class="ic-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '<svg class="ic-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M2 12h2.4M19.6 12H22M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7" stroke-linecap="round"/></svg>';
    right.insertBefore(btn, right.firstChild);
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      var tc = document.querySelector('meta[name="theme-color"]');
      if (tc) tc.setAttribute("content", next === "dark" ? "#14161b" : "#1f2229");
    });
  })();

  /* ---- Scroll progress bar ---- */
  (function () {
    var bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.appendChild(bar);
    var update = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  })();

  /* ---- Back to top ---- */
  (function () {
    var b = document.createElement("button");
    b.className = "to-top";
    b.setAttribute("aria-label", "Back to top");
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M6 11l6-6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    document.body.appendChild(b);
    var onScroll = function () { b.classList.toggle("show", window.scrollY > 600); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    b.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  })();

  /* ---- 3D tilt on cards ---- */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    var cards = document.querySelectorAll(".project, .gallery-item, .like");
    cards.forEach(function (card) {
      card.classList.add("tilt");
      var MAX = 6;
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.classList.add("is-tilting");
        card.style.transform =
          "perspective(900px) rotateX(" + (-py * MAX).toFixed(2) + "deg) rotateY(" + (px * MAX).toFixed(2) + "deg) translateY(-4px)";
      });
      var reset = function () {
        card.classList.remove("is-tilting");
        card.style.transform = "";
      };
      card.addEventListener("pointerleave", reset);
      card.addEventListener("blur", reset, true);
    });
  }

  /* ---- Konami code easter egg ---- */
  (function () {
    var seq = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
    var pos = 0;
    window.addEventListener("keydown", function (e) {
      var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = (k === seq[pos]) ? pos + 1 : (k === seq[0] ? 1 : 0);
      if (pos === seq.length) { pos = 0; party(); }
    });
    function party() {
      if (!reduce) {
        var colors = ["#2f6bff", "#f5402c", "#7aa5ff", "#1f2229", "#ffd23f"];
        for (var i = 0; i < 120; i++) {
          var p = document.createElement("div");
          p.className = "confetti-piece";
          var w = 6 + Math.random() * 7;
          p.style.left = Math.random() * 100 + "vw";
          p.style.width = w + "px";
          p.style.height = (w * 1.6) + "px";
          p.style.background = colors[i % colors.length];
          p.style.setProperty("--dx", (Math.random() * 240 - 120) + "px");
          p.style.setProperty("--rot", (Math.random() * 1080 - 360) + "deg");
          p.style.animationDuration = (2.4 + Math.random() * 2) + "s";
          p.style.animationDelay = (Math.random() * 0.6) + "s";
          document.body.appendChild(p);
          (function (el) { setTimeout(function () { el.remove(); }, 5200); })(p);
        }
      }
      var toast = document.createElement("div");
      toast.className = "easter-toast";
      toast.innerHTML = 'You found the secret! <span class="spark">✦</span> Told you I was a builder.';
      document.body.appendChild(toast);
      requestAnimationFrame(function () { toast.classList.add("show"); });
      setTimeout(function () { toast.classList.remove("show"); setTimeout(function () { toast.remove(); }, 500); }, 3600);
    }
    window.__party = party; // used by the command palette too
  })();

  /* ============================================================
     Sound engine (WebAudio, no files) — off by default
     ============================================================ */
  var Sound = (function () {
    var on = false, ctx = null;
    try { on = localStorage.getItem("sound") === "on"; } catch (e) {}
    function ac() {
      if (!ctx) { var AC = window.AudioContext || window.webkitAudioContext; if (AC) ctx = new AC(); }
      if (ctx && ctx.state === "suspended") ctx.resume();
      return ctx;
    }
    function blip(freq, dur, gain, type, slide) {
      if (!on) return;
      var c = ac(); if (!c) return;
      var o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
      o.type = type || "sine";
      o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(gain, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(c.destination);
      o.start(t); o.stop(t + dur + 0.02);
    }
    return {
      isOn: function () { return on; },
      set: function (v) { on = v; try { localStorage.setItem("sound", v ? "on" : "off"); } catch (e) {} if (v) blip(660, .09, .05, "sine", 880); },
      tick:  function () { blip(1500, .04, .022, "sine"); },
      pop:   function () { blip(420, .1, .06, "sine", 240); },
      whoosh:function () { blip(220, .18, .045, "sine", 720); },
      nav:   function () { blip(520, .14, .05, "triangle", 780); }
    };
  })();

  // Sound toggle button in nav
  (function () {
    var right = document.querySelector(".nav__right");
    if (!right) return;
    var b = document.createElement("button");
    b.className = "sound-toggle" + (Sound.isOn() ? " sound-on" : "");
    b.setAttribute("aria-label", "Toggle sound effects");
    b.setAttribute("title", "Sound effects");
    b.innerHTML =
      '<svg class="ic-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5 6.5 9H3v6h3.5L11 19V5z" stroke-linejoin="round"/><path d="M22 9l-5 6M17 9l5 6" stroke-linecap="round"/></svg>' +
      '<svg class="ic-on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5 6.5 9H3v6h3.5L11 19V5z" stroke-linejoin="round"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.8a9 9 0 0 1 0 12.4" stroke-linecap="round"/></svg>';
    right.insertBefore(b, right.firstChild);
    b.addEventListener("click", function () {
      var next = !Sound.isOn();
      Sound.set(next);
      b.classList.toggle("sound-on", next);
    });
    // Global hooks: hover ticks + click pops
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest && e.target.closest("a, button")) Sound.tick();
    });
    document.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a, button")) Sound.pop();
    });
  })();

  /* ============================================================
     Command palette (⌘K / Ctrl+K)
     ============================================================ */
  (function () {
    var ICONS = {
      home:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-8 9 8M5 9.5V21h5v-6h4v6h5V9.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      built: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a4.5 4.5 0 0 0-6 6L3 18v3h3l5.7-5.7a4.5 4.5 0 0 0 6-6L14 13l-3-3z" stroke-linejoin="round"/></svg>',
      star:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 5.9L12 16.4 6.7 19.3l1.2-5.9L3.4 9.3l6-.7z" stroke-linejoin="round"/></svg>',
      photo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 15l5-5 4 4 3-3 6 6" stroke-linejoin="round"/></svg>',
      user:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" stroke-linecap="round"/></svg>',
      globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
      moon:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" stroke-linejoin="round"/></svg>',
      mail:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
      gh:    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 3 .8.1-.6.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5a3.9 3.9 0 0 1 1-2.7 3.6 3.6 0 0 1 .1-2.7s.9-.3 2.8 1a9.5 9.5 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1a3.6 3.6 0 0 1 .1 2.7 3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/></svg>',
      party: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5.8 11.3 2 22l10.7-3.8M4 3h.01M22 8h.01M15 2h.01M22 20h.01M22 2l-2.3 2.3a3 3 0 0 0-.9 2.1V7a3 3 0 0 1-3 3h-.6a3 3 0 0 0-2.1.9L11 13" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 13 5.8 11.3a1 1 0 0 0-1.1 1.6l6.4 6.4a1 1 0 0 0 1.6-1.1z" stroke-linejoin="round"/></svg>',
      coffee:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8h1a3 3 0 0 1 0 6h-1M3 8h14v7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" stroke-linejoin="round"/><path d="M7 2v2M11 2v2M15 2v2" stroke-linecap="round"/></svg>',
      term:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M13 15h4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      pad:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="10" rx="5"/><path d="M7 12h3M8.5 10.5v3M15 11h.01M18 13h.01" stroke-linecap="round"/></svg>',
      trophy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 4h10v4a5 5 0 0 1-10 0V4z" stroke-linejoin="round"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 21h6M12 13v4M9 21c0-2 1.5-3 3-3s3 1 3 3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    };
    var items = [
      { t: "Home",            sub: "Page",   ic: "home",  go: "index.html" },
      { t: "Stuff I've Built",sub: "Page",   ic: "built", go: "work.html" },
      { t: "Interests",       sub: "Page",   ic: "star",  go: "interests.html" },
      { t: "Gallery",         sub: "Page",   ic: "photo", go: "gallery.html" },
      { t: "About Me",        sub: "Page",   ic: "user",  go: "about.html" },
      { t: "Traveling",       sub: "Interest", ic: "globe", go: "traveling.html" },
      { t: "Video Games",     sub: "Interest", ic: "star",  go: "video-games.html" },
      { t: "Photography",     sub: "Interest", ic: "photo", go: "photography.html" },
      { t: "Cooking",         sub: "Interest", ic: "star",  go: "cooking.html" },
      { t: "Golf",            sub: "Interest", ic: "star",  go: "golf.html" },
      { t: "Basketball",      sub: "Interest", ic: "star",  go: "basketball.html" },
      { t: "Football",        sub: "Interest", ic: "star",  go: "football.html" },
      { t: "Aerospace",       sub: "Interest", ic: "star",  go: "aerospace.html" },
      { t: "Toggle dark mode",sub: "Action", ic: "moon",  run: function () { var b = document.querySelector(".theme-toggle"); if (b) b.click(); } },
      { t: "Copy my email",   sub: "Action", ic: "mail",  run: function () {
          if (navigator.clipboard) navigator.clipboard.writeText("shaurya8sharma@gmail.com");
          var s = document.querySelector(".palette__input"); if (s) { s.value = ""; s.placeholder = "Copied! ✦"; setTimeout(function(){ s.placeholder = "Search pages & actions…"; }, 1500); }
        }, stay: true },
      { t: "Open my GitHub",  sub: "Link",   ic: "gh",    go: "https://github.com/shaurya8sharma-bot", ext: true },
      { t: "Buy me a coffee", sub: "Link",   ic: "coffee",go: "https://buymeacoffee.com/shauryasharma", ext: true },
      { t: "Confetti, please",sub: "Fun",    ic: "party", run: function () { if (window.__party) window.__party(); } },
      { t: "Open terminal",   sub: "Fun",    ic: "term",  run: function () { if (window.__terminal) window.__terminal(); } },
      { t: "Play Bolt Catch", sub: "Game",   ic: "pad",   run: function () { if (window.__game) window.__game(); } },
      { t: "Achievements",    sub: "Fun",    ic: "trophy",run: function () { if (window.__ach) window.__ach.open(); } }
    ];

    var backdrop = document.createElement("div"); backdrop.className = "palette-backdrop";
    var pal = document.createElement("div"); pal.className = "palette";
    pal.setAttribute("role", "dialog"); pal.setAttribute("aria-label", "Command palette");
    pal.innerHTML =
      '<div class="palette__head">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5" stroke-linecap="round"/></svg>' +
        '<input class="palette__input" type="text" placeholder="Search pages & actions…" aria-label="Search" />' +
        '<span class="palette__esc">ESC</span>' +
      '</div><ul class="palette__list"></ul>';
    document.body.appendChild(backdrop); document.body.appendChild(pal);
    var input = pal.querySelector(".palette__input");
    var list = pal.querySelector(".palette__list");
    var open = false, sel = 0, visible = items;

    function render() {
      list.innerHTML = "";
      if (!visible.length) { list.innerHTML = '<li class="palette__empty">Nothing found — try “home” or “confetti”.</li>'; return; }
      visible.forEach(function (it, i) {
        var li = document.createElement("li");
        li.className = "palette__item" + (i === sel ? " sel" : "");
        li.innerHTML = ICONS[it.ic] + "<span>" + it.t + "</span><span class='sub'>" + it.sub + "</span>";
        li.addEventListener("mouseenter", function () { sel = i; render(); });
        li.addEventListener("click", function () { pick(it); });
        list.appendChild(li);
      });
    }
    function filter() {
      var q = input.value.trim().toLowerCase();
      visible = !q ? items : items.filter(function (it) { return (it.t + " " + it.sub).toLowerCase().indexOf(q) !== -1; });
      sel = 0; render();
    }
    function show() {
      open = true; backdrop.classList.add("open"); pal.classList.add("open");
      input.value = ""; filter(); Sound.whoosh();
      setTimeout(function () { input.focus(); }, 40);
    }
    function hide() { open = false; backdrop.classList.remove("open"); pal.classList.remove("open"); input.blur(); }
    function pick(it) {
      Sound.nav();
      if (it.run) { it.run(); if (!it.stay) hide(); return; }
      if (it.ext) { window.open(it.go, "_blank", "noopener"); hide(); return; }
      hide();
      if (window.__wipeTo) window.__wipeTo(it.go); else location.href = it.go;
    }
    window.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); open ? hide() : show(); return; }
      if (!open) return;
      if (e.key === "Escape") { hide(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % visible.length; render(); Sound.tick(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + visible.length) % visible.length; render(); Sound.tick(); }
      else if (e.key === "Enter" && visible[sel]) { e.preventDefault(); pick(visible[sel]); }
    });
    input.addEventListener("input", filter);
    backdrop.addEventListener("click", hide);

    // Nav hint button
    var right = document.querySelector(".nav__right");
    if (right) {
      var hint = document.createElement("button");
      hint.className = "palette-hint";
      hint.setAttribute("aria-label", "Open command palette");
      var isMac = /Mac|iPhone|iPad/.test(navigator.platform || "");
      hint.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5" stroke-linecap="round"/></svg><span>' + (isMac ? "⌘" : "Ctrl+") + "K</span>";
      hint.addEventListener("click", show);
      right.insertBefore(hint, right.querySelector(".btn"));
    }
  })();

  /* ============================================================
     Custom cursor + magnetic buttons (desktop only)
     ============================================================ */
  if (!reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    (function () {
      var dot = document.createElement("div"); dot.className = "cursor-dot";
      var ring = document.createElement("div"); ring.className = "cursor-ring";
      document.body.appendChild(dot); document.body.appendChild(ring);
      document.body.classList.add("has-cursor", "cursor-hidden");
      var mx = -100, my = -100, rx = -100, ry = -100, seen = false;
      document.addEventListener("mousemove", function (e) {
        mx = e.clientX; my = e.clientY;
        if (!seen) { seen = true; rx = mx; ry = my; document.body.classList.remove("cursor-hidden"); }
      });
      document.addEventListener("mouseleave", function () { document.body.classList.add("cursor-hidden"); seen = false; });
      document.addEventListener("mousedown", function () { dot.classList.add("pressed"); });
      document.addEventListener("mouseup", function () { dot.classList.remove("pressed"); });
      document.addEventListener("mouseover", function (e) {
        ring.classList.toggle("on-link", !!(e.target.closest && e.target.closest("a, button, .project, .like, .gallery-item")));
      });
      (function loop() {
        rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
        dot.style.transform = "translate(" + mx + "px," + my + "px)" + (dot.classList.contains("pressed") ? " scale(2.2)" : "");
        ring.style.transform = "translate(" + rx + "px," + ry + "px)";
        requestAnimationFrame(loop);
      })();

      // Magnetic buttons
      document.querySelectorAll(".btn").forEach(function (btn) {
        btn.classList.add("magnetic");
        var R = 90;
        btn.addEventListener("pointermove", function (e) {
          var r = btn.getBoundingClientRect();
          var dx = e.clientX - (r.left + r.width / 2);
          var dy = e.clientY - (r.top + r.height / 2);
          var d = Math.hypot(dx, dy);
          var pull = Math.max(0, 1 - d / (R + Math.max(r.width, r.height) / 2));
          btn.style.transform = "translate(" + (dx * pull * 0.35) + "px," + (dy * pull * 0.35) + "px)";
        });
        btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
      });
    })();
  }

  /* ============================================================
     Page transitions (wipe)
     ============================================================ */
  (function () {
    if (reduce) return;
    var wipe = document.createElement("div");
    wipe.className = "page-wipe";
    wipe.innerHTML = '<span class="mark">S<i>.</i></span>';
    document.body.appendChild(wipe);

    var entering = false;
    try { entering = sessionStorage.getItem("wiped") === "1"; sessionStorage.removeItem("wiped"); } catch (e) {}
    if (entering) {
      wipe.classList.add("in");
      wipe.addEventListener("animationend", function () { wipe.classList.remove("in"); });
      // Safety net: never let the curtain stick (throttled tabs, missed events)
      setTimeout(function () { wipe.classList.remove("in"); }, 900);
    }

    var leaving = false;
    function wipeTo(href) {
      if (leaving) return; leaving = true;
      try { sessionStorage.setItem("wiped", "1"); } catch (e) {}
      Sound.nav();
      wipe.classList.add("out");
      setTimeout(function () { location.href = href; }, 400);
    }
    window.__wipeTo = wipeTo;

    document.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#" || /^(https?:|mailto:|tel:)/.test(href)) return;
      e.preventDefault();
      wipeTo(href);
    });
    // bfcache: if user comes back, make sure the curtain is gone
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) { leaving = false; wipe.classList.remove("out", "in"); }
    });
  })();

  /* ============================================================
     Live GitHub repos (homepage)
     ============================================================ */
  (function () {
    var grid = document.getElementById("gh-grid");
    if (!grid) return;
    var USER = "shaurya8sharma-bot";
    fetch("https://api.github.com/users/" + USER + "/repos?sort=pushed&per_page=6")
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (repos) {
        repos = (repos || []).filter(function (r) { return !r.fork; }).slice(0, 6);
        grid.innerHTML = "";
        if (!repos.length) {
          grid.innerHTML =
            '<div class="gh-card" style="grid-column:1/-1;text-align:center;padding:34px">' +
            '<span class="gh-card__desc" style="font-size:1rem">Nothing public up here yet — the good stuff is still cooking. 🍳<br>' +
            'The moment I push a repo, it shows up right here. Automatically.</span></div>';
          return;
        }
        repos.forEach(function (r) {
          var a = document.createElement("a");
          a.className = "gh-card";
          a.href = r.html_url; a.target = "_blank"; a.rel = "noopener";
          var when = new Date(r.pushed_at);
          var days = Math.round((Date.now() - when) / 864e5);
          var ago = days <= 0 ? "today" : days === 1 ? "yesterday" : days < 30 ? days + "d ago" : days < 365 ? Math.round(days / 30) + "mo ago" : Math.round(days / 365) + "y ago";
          a.innerHTML =
            '<span class="gh-card__name"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 4.5v15z" stroke-linejoin="round"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" stroke-linejoin="round"/></svg>' + r.name + "</span>" +
            '<span class="gh-card__desc">' + (r.description ? r.description.replace(/</g, "&lt;") : "No description yet — classic.") + "</span>" +
            '<span class="gh-card__meta">' + (r.language ? '<span class="lang">' + r.language + "</span>" : "") + "<span>★ " + r.stargazers_count + "</span><span>updated " + ago + "</span></span>";
          grid.appendChild(a);
        });
      })
      .catch(function () {
        var sec = grid.closest("section");
        if (sec) sec.style.display = "none";
      });
  })();

  /* ============================================================
     Achievements system
     ============================================================ */
  var Ach = (function () {
    var ICON = {
      moon:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" stroke-linejoin="round"/></svg>',
      globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
      bolt:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2 4 14h6l-1 8 9-12h-6z" stroke-linejoin="round"/></svg>',
      term:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M13 15h4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      pad:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="10" rx="5"/><path d="M7 12h3M8.5 10.5v3M15 11h.01M18 13h.01" stroke-linecap="round"/></svg>',
      map:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2z" stroke-linejoin="round"/><path d="M9 3v16M15 5v16" stroke-linecap="round"/></svg>',
      trophy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 4h10v4a5 5 0 0 1-10 0V4z" stroke-linejoin="round"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 21h6M12 13v4M9 21c0-2 1.5-3 3-3s3 1 3 3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    };
    var DEFS = [
      { id: "night-owl",    ic: "moon",  t: "Night Owl",     d: "Flipped the site into dark mode." },
      { id: "globe-trotter",ic: "globe", t: "Globe Trotter", d: "Grabbed and spun the world map." },
      { id: "hacker",       ic: "bolt",  t: "Hacker",        d: "Cracked the Konami code. ↑↑↓↓←→←→BA" },
      { id: "terminal",     ic: "term",  t: "Terminal Wizard",d: "Opened the secret terminal." },
      { id: "high-scorer",  ic: "pad",   t: "High Scorer",   d: "Played Bolt Catch." },
      { id: "explorer",     ic: "map",   t: "Explorer",      d: "Visited every main page." }
    ];
    var KEY = "ach", VKEY = "ach-pages";
    function load() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } }
    function save(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} }
    function toast(def) {
      var el = document.createElement("div");
      el.className = "ach-toast";
      el.innerHTML =
        '<div class="ach-toast__ic">' + ICON[def.ic] + "</div>" +
        '<div><div class="ach-toast__k">Achievement unlocked</div>' +
        '<div class="ach-toast__t">' + def.t + '</div><div class="ach-toast__d">' + def.d + "</div></div>";
      document.body.appendChild(el);
      requestAnimationFrame(function () { el.classList.add("show"); });
      if (typeof Sound !== "undefined") Sound.pop();
      setTimeout(function () { el.classList.remove("show"); setTimeout(function () { el.remove(); }, 600); }, 4200);
    }
    function unlock(id) {
      var got = load();
      if (got.indexOf(id) !== -1) return;
      var def = DEFS.filter(function (d) { return d.id === id; })[0];
      if (!def) return;
      got.push(id); save(got); toast(def);
    }
    // Track visited pages for "Explorer"
    (function () {
      var main = { "index.html": 1, "work.html": 1, "interests.html": 1, "gallery.html": 1, "about.html": 1, "": 1 };
      var page = location.pathname.split("/").pop();
      if (main[page] == null) return;
      var seen = [];
      try { seen = JSON.parse(localStorage.getItem(VKEY) || "[]"); } catch (e) {}
      var key = page === "" ? "index.html" : page;
      if (seen.indexOf(key) === -1) { seen.push(key); try { localStorage.setItem(VKEY, JSON.stringify(seen)); } catch (e) {} }
      var need = ["index.html", "work.html", "interests.html", "gallery.html", "about.html"];
      if (need.every(function (p) { return seen.indexOf(p) !== -1; })) setTimeout(function () { unlock("explorer"); }, 700);
    })();
    // Drawer
    var backdrop, drawer;
    function buildDrawer() {
      if (drawer) return;
      backdrop = document.createElement("div"); backdrop.className = "ach-drawer-backdrop";
      drawer = document.createElement("aside"); drawer.className = "ach-drawer";
      document.body.appendChild(backdrop); document.body.appendChild(drawer);
      backdrop.addEventListener("click", closeDrawer);
    }
    function renderDrawer() {
      var got = load();
      var rows = DEFS.map(function (d) {
        var has = got.indexOf(d.id) !== -1;
        return '<div class="ach-row ' + (has ? "unlocked" : "locked") + '">' +
          '<div class="ach-row__ic">' + (has ? ICON[d.ic] : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke-linecap="round"/></svg>') + "</div>" +
          '<div><div class="ach-row__t">' + (has ? d.t : "???") + '</div><div class="ach-row__d">' + d.d + "</div></div>" +
          '<span class="ach-row__badge">' + (has ? "Unlocked" : "Locked") + "</span></div>";
      }).join("");
      drawer.innerHTML =
        '<div class="ach-drawer__head"><div>' + ICON.trophy.replace("currentColor", "var(--coral-600)") + "</div>" +
        "<h3>Achievements</h3>" +
        '<span class="ach-drawer__count">' + got.length + " / " + DEFS.length + "</span>" +
        '<button class="ach-drawer__close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg></button></div>' +
        '<p class="ach-drawer__sub">Little rewards for poking around. Try dark mode, the globe, and ⌘K → "Confetti".</p>' +
        '<div class="ach-list">' + rows + "</div>";
      drawer.querySelector(".ach-drawer__close").addEventListener("click", closeDrawer);
    }
    function openDrawer() { buildDrawer(); renderDrawer(); backdrop.classList.add("open"); drawer.classList.add("open"); if (typeof Sound !== "undefined") Sound.whoosh(); }
    function closeDrawer() { if (drawer) { backdrop.classList.remove("open"); drawer.classList.remove("open"); } }
    return { unlock: unlock, open: openDrawer };
  })();
  window.__ach = Ach;

  // Hook achievements into existing features
  (function () {
    var tt = document.querySelector(".theme-toggle");
    if (tt) tt.addEventListener("click", function () {
      if (document.documentElement.getAttribute("data-theme") === "dark") Ach.unlock("night-owl");
    });
    var globe = document.getElementById("globe");
    if (globe) globe.addEventListener("pointerdown", function () { Ach.unlock("globe-trotter"); }, { once: true });
    if (window.__party) { var orig = window.__party; window.__party = function () { orig(); Ach.unlock("hacker"); }; }
  })();

  /* ============================================================
     Particle hero (homepage only) + parallax
     ============================================================ */
  if (!reduce) (function () {
    var hero = document.querySelector(".hero--photo");
    if (hero) {
      var scrim = hero.querySelector(".hero__scrim");
      var cv = document.createElement("canvas");
      cv.className = "hero-particles";
      if (scrim && scrim.nextSibling) hero.insertBefore(cv, scrim.nextSibling); else hero.appendChild(cv);
      var ctx = cv.getContext("2d");
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var W = 0, H = 0, parts = [], mouse = { x: -999, y: -999 };
      function size() {
        W = hero.clientWidth; H = hero.clientHeight;
        cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var target = Math.min(90, Math.round(W * H / 16000));
        parts = [];
        for (var i = 0; i < target; i++) parts.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28,
          r: Math.random() * 2 + 1
        });
      }
      hero.addEventListener("pointermove", function (e) {
        var b = hero.getBoundingClientRect(); mouse.x = e.clientX - b.left; mouse.y = e.clientY - b.top;
      });
      hero.addEventListener("pointerleave", function () { mouse.x = -999; mouse.y = -999; });
      var LINK = 118;
      function frame() {
        if (!W) { requestAnimationFrame(frame); return; }
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i];
          var dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < 14000 && d2 > 0.1) { var f = (14000 - d2) / 14000 * 1.6; var d = Math.sqrt(d2); p.vx += (dx / d) * f * .08; p.vy += (dy / d) * f * .08; }
          p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy;
          if (p.x < 0) p.x += W; if (p.x > W) p.x -= W; if (p.y < 0) p.y += H; if (p.y > H) p.y -= H;
          for (var j = i + 1; j < parts.length; j++) {
            var q = parts[j], lx = p.x - q.x, ly = p.y - q.y, ld = Math.sqrt(lx * lx + ly * ly);
            if (ld < LINK) { ctx.globalAlpha = (1 - ld / LINK) * .22; ctx.strokeStyle = "#cfe0ff"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
          }
          ctx.globalAlpha = .55; ctx.fillStyle = "#eaf1ff"; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
        }
        ctx.globalAlpha = 1;
        requestAnimationFrame(frame);
      }
      size(); window.addEventListener("resize", size); window.addEventListener("load", size); requestAnimationFrame(frame);
    }

    // Cinematic parallax (elements with data-parallax = speed)
    var pxEls = [].slice.call(document.querySelectorAll("[data-parallax]"));
    var heroImg = document.getElementById("heroImg");
    if (heroImg) pxEls.push(heroImg);
    if (pxEls.length) {
      var ticking = false;
      var onScroll = function () {
        if (ticking) return; ticking = true;
        requestAnimationFrame(function () {
          var y = window.scrollY;
          pxEls.forEach(function (el) {
            var sp = el === heroImg ? 0.18 : parseFloat(el.getAttribute("data-parallax")) || 0.2;
            el.style.transform = (el === heroImg ? "scale(1.09) " : "") + "translate3d(0," + (y * sp) + "px,0)";
          });
          ticking = false;
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  })();

  /* ============================================================
     Hidden terminal  (type "shaurya" or footer icon)
     ============================================================ */
  (function () {
    var backdrop, screen, input, built = false;
    var JOKES = [
      "Why do programmers prefer dark mode? Because light attracts bugs. ✨",
      "There are 10 kinds of people: those who read binary and those who don't.",
      "I'd tell you a UDP joke, but you might not get it.",
      "Why was the JavaScript developer sad? He didn't Node how to Express himself.",
      "A SQL query walks into a bar, goes up to two tables and asks: 'Can I join you?'"
    ];
    function build() {
      if (built) return; built = true;
      backdrop = document.createElement("div"); backdrop.className = "term-backdrop";
      backdrop.innerHTML =
        '<div class="term" role="dialog" aria-label="Terminal">' +
          '<div class="term__bar"><span class="term__dot term__dot--r"></span><span class="term__dot term__dot--y"></span><span class="term__dot term__dot--g"></span>' +
          '<span class="term__title"><b>guest@shaurya</b>:~ — type <b>help</b></span></div>' +
          '<div class="term__body" id="term-body"></div>' +
          '<form class="term__prompt"><span class="term__ps1">❯</span><input class="term__input" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Terminal input" /></form>' +
        "</div>";
      document.body.appendChild(backdrop);
      screen = backdrop.querySelector("#term-body");
      input = backdrop.querySelector(".term__input");
      backdrop.addEventListener("click", function (e) { if (e.target === backdrop) close(); });
      backdrop.querySelector("form").addEventListener("submit", function (e) { e.preventDefault(); run(input.value); input.value = ""; });
      print('<span class="c-grn">shaurya.dev</span> — interactive shell. Type <span class="c-yel">help</span> to see what I can do.');
    }
    function print(html) { var l = document.createElement("div"); l.className = "term__line"; l.innerHTML = html; screen.appendChild(l); screen.scrollTop = screen.scrollHeight; }
    function open() {
      build(); backdrop.classList.add("open");
      setTimeout(function () { input.focus(); }, 60);
      if (typeof Sound !== "undefined") Sound.whoosh();
      if (window.__ach) window.__ach.unlock("terminal");
    }
    function close() { if (backdrop) backdrop.classList.remove("open"); }
    function go(href) { close(); if (window.__wipeTo) window.__wipeTo(href); else location.href = href; }
    function run(raw) {
      var cmd = (raw || "").trim().toLowerCase();
      if (!cmd) return;
      print('<span class="c-grn">❯</span> <span class="c-dim">' + raw.replace(/</g, "&lt;") + "</span>");
      switch (cmd.split(" ")[0]) {
        case "help": print("Commands: <span class='c-yel'>about  projects  interests  travel  social  game  trophies  theme  joke  matrix  clear  exit</span>"); break;
        case "about": print("Hey — I'm Shaurya. I build games, apps, gadgets, and things out in the real world. This whole site is one of my builds. ✨"); break;
        case "projects": print("Opening my builds… <span class='c-dim'>(work.html)</span>"); go("work.html"); break;
        case "interests": print("I'm into: video games, photography, cooking, golf, basketball, football, aerospace, traveling. → <span class='c-blue'>interests.html</span>"); break;
        case "travel": print("13 countries + islands on a spinnable globe → opening…"); go("traveling.html"); break;
        case "social": print("GitHub: <a href='https://github.com/shaurya8sharma-bot' target='_blank' rel='noopener'>@shaurya8sharma-bot</a>  ·  Coffee: <a href='https://buymeacoffee.com/shauryasharma' target='_blank' rel='noopener'>buymeacoffee.com/shauryasharma</a>  ·  Email: shaurya8sharma@gmail.com"); break;
        case "game": print("Launching <span class='c-yel'>Bolt Catch</span>… catch bolts, dodge wrenches!"); close(); if (window.__game) window.__game(); break;
        case "trophies": case "achievements": print("Opening the trophy shelf…"); close(); if (window.__ach) window.__ach.open(); break;
        case "theme": var b = document.querySelector(".theme-toggle"); if (b) b.click(); print("Theme toggled. 🌗"); break;
        case "joke": print('<span class="c-blue">' + JOKES[Math.floor(Math.random() * JOKES.length)] + "</span>"); break;
        case "matrix": print("<span class='c-grn'>Entering the matrix… (5s)</span>"); matrix(); break;
        case "whoami": print("guest@shaurya.dev — but the cool one is me."); break;
        case "sudo": print("<span class='c-red'>Nice try. You don't have root here. 😉</span>"); break;
        case "clear": screen.innerHTML = ""; break;
        case "exit": case "quit": print("Bye! 👋"); setTimeout(close, 250); break;
        default: print('<span class="c-red">command not found:</span> ' + cmd.split(" ")[0] + " — try <span class='c-yel'>help</span>");
      }
    }
    function matrix() {
      var c = document.createElement("canvas"); c.className = "matrix-canvas";
      document.body.appendChild(c);
      var x = c.getContext("2d"), w = c.width = innerWidth, h = c.height = innerHeight;
      var cols = Math.floor(w / 14), drops = new Array(cols).fill(1);
      var chars = "01アカサタナハマヤラワSHAURYA";
      var t0 = Date.now(), iv = setInterval(function () {
        x.fillStyle = "rgba(6,10,8,.12)"; x.fillRect(0, 0, w, h);
        x.fillStyle = "#3ee06a"; x.font = "14px monospace";
        for (var i = 0; i < drops.length; i++) {
          x.fillText(chars[Math.floor(Math.random() * chars.length)], i * 14, drops[i] * 14);
          if (drops[i] * 14 > h && Math.random() > .975) drops[i] = 0;
          drops[i]++;
        }
        if (Date.now() - t0 > 5000) { clearInterval(iv); c.style.transition = "opacity .6s"; c.style.opacity = "0"; setTimeout(function () { c.remove(); }, 650); }
      }, 45);
    }
    window.__terminal = open;

    // "shaurya" keystroke trigger
    var buf = "";
    window.addEventListener("keydown", function (e) {
      var tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.key && e.key.length === 1) { buf = (buf + e.key.toLowerCase()).slice(-7); if (buf === "shaurya") { buf = ""; open(); } }
    });

    // Footer terminal icon (injected)
    var fb = document.querySelector(".footer__brand");
    if (fb) {
      var tbtn = document.createElement("button");
      tbtn.className = "sound-toggle"; tbtn.style.marginTop = "16px"; tbtn.style.color = "#fff"; tbtn.style.borderColor = "rgba(255,255,255,.28)";
      tbtn.setAttribute("aria-label", "Open terminal"); tbtn.setAttribute("title", "Secret terminal (or type 'shaurya')");
      tbtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M13 15h4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      tbtn.addEventListener("click", open);
      fb.appendChild(tbtn);
    }
  })();

  /* ============================================================
     Mini-game — Bolt Catch
     ============================================================ */
  (function () {
    var backdrop, cvs, ctx, overlay, scoreEl, livesEl, bestEl, built = false;
    var W = 520, H = 380, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var running = false, raf = 0, player, items, score, lives, spd, spawnT, best;
    var keys = {};
    function build() {
      if (built) return; built = true;
      best = parseInt((function () { try { return localStorage.getItem("bolt-best"); } catch (e) { return 0; } })() || "0", 10);
      backdrop = document.createElement("div"); backdrop.className = "game-backdrop";
      backdrop.innerHTML =
        '<div class="game" role="dialog" aria-label="Bolt Catch game">' +
          '<div class="game__head"><h3>Bolt Catch</h3>' +
            '<div class="game__stats"><span>Score <b id="g-score">0</b></span><span>Lives <b id="g-lives">3</b></span><span>Best <b id="g-best">' + best + '</b></span></div>' +
            '<button class="game__close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg></button></div>' +
          '<div class="game__stage"><canvas></canvas>' +
            '<div class="game__overlay" id="g-over"><div><h4>Catch the bolts 🔩</h4><p>Move with your mouse or ← →. Grab blue bolts, dodge the red wrenches.</p>' +
            '<button class="btn btn--coral" id="g-start">Start</button><div class="game__hint">First to 3 misses loses. Good luck!</div></div></div>' +
          "</div>" +
        "</div>";
      document.body.appendChild(backdrop);
      cvs = backdrop.querySelector("canvas"); ctx = cvs.getContext("2d");
      cvs.width = W * dpr; cvs.height = H * dpr; cvs.style.height = (H) + "px"; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      overlay = backdrop.querySelector("#g-over");
      scoreEl = backdrop.querySelector("#g-score"); livesEl = backdrop.querySelector("#g-lives"); bestEl = backdrop.querySelector("#g-best");
      backdrop.querySelector(".game__close").addEventListener("click", close);
      backdrop.addEventListener("click", function (e) { if (e.target === backdrop) close(); });
      backdrop.querySelector("#g-start").addEventListener("click", start);
      cvs.addEventListener("pointermove", function (e) { var b = cvs.getBoundingClientRect(); player.x = (e.clientX - b.left) * (W / b.width); });
      window.addEventListener("keydown", function (e) { keys[e.key] = true; });
      window.addEventListener("keyup", function (e) { keys[e.key] = false; });
    }
    function reset() { player = { x: W / 2, w: 74, h: 14 }; items = []; score = 0; lives = 3; spd = 2.4; spawnT = 0; }
    function start() { reset(); overlay.classList.add("hide"); running = true; scoreEl.textContent = 0; livesEl.textContent = 3; if (typeof Sound !== "undefined") Sound.nav(); loop(); }
    function end() {
      running = false; cancelAnimationFrame(raf);
      if (score > best) { best = score; try { localStorage.setItem("bolt-best", best); } catch (e) {} bestEl.textContent = best; }
      overlay.innerHTML = '<div><h4>' + (score >= 20 ? "Nice run! 🎉" : "Game over") + '</h4><p>You caught <b>' + score + '</b> bolts. Best: <b>' + best + '</b>.</p><button class="btn btn--coral" id="g-again">Play again</button><div class="game__hint">Press Start to run it back.</div></div>';
      overlay.classList.remove("hide");
      overlay.querySelector("#g-again").addEventListener("click", start);
      if (window.__ach) window.__ach.unlock("high-scorer");
    }
    function loop() {
      raf = requestAnimationFrame(loop);
      if (keys["ArrowLeft"]) player.x -= 6; if (keys["ArrowRight"]) player.x += 6;
      player.x = Math.max(player.w / 2, Math.min(W - player.w / 2, player.x));
      spawnT--; if (spawnT <= 0) { spawnT = Math.max(22, 60 - score); items.push({ x: 24 + Math.random() * (W - 48), y: -18, bolt: Math.random() > .28, r: 13 }); }
      var css = getComputedStyle(document.documentElement);
      var paper = css.getPropertyValue("--paper") || "#f3f4f6";
      ctx.clearRect(0, 0, W, H);
      // player tray
      ctx.fillStyle = "#1f2229"; roundRect(player.x - player.w / 2, H - 34, player.w, player.h, 7); ctx.fill();
      ctx.fillStyle = "#2f6bff"; roundRect(player.x - player.w / 2, H - 34, player.w, 4, 2); ctx.fill();
      for (var i = items.length - 1; i >= 0; i--) {
        var it = items[i]; it.y += spd + score * .03;
        if (it.bolt) { ctx.fillStyle = "#2f6bff"; ctx.beginPath(); ctx.moveTo(it.x, it.y - 12); ctx.lineTo(it.x - 6, it.y + 2); ctx.lineTo(it.x, it.y); ctx.lineTo(it.x - 2, it.y + 12); ctx.lineTo(it.x + 7, it.y - 3); ctx.lineTo(it.x + 1, it.y - 3); ctx.closePath(); ctx.fill(); }
        else { ctx.strokeStyle = "#f5402c"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(it.x, it.y, 8, 0.6, 5.4); ctx.stroke(); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(it.x + 5, it.y + 5); ctx.lineTo(it.x + 12, it.y + 12); ctx.stroke(); }
        if (it.y > H - 40 && it.y < H - 20 && Math.abs(it.x - player.x) < player.w / 2 + 8) {
          if (it.bolt) { score++; scoreEl.textContent = score; if (typeof Sound !== "undefined") Sound.tick(); }
          else { lives--; livesEl.textContent = lives; if (typeof Sound !== "undefined") Sound.pop(); if (lives <= 0) { items.splice(i, 1); return end(); } }
          items.splice(i, 1); continue;
        }
        if (it.y > H + 20) { if (it.bolt) { lives--; livesEl.textContent = lives; if (lives <= 0) { items.splice(i, 1); return end(); } } items.splice(i, 1); }
      }
    }
    function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
    function open() { build(); backdrop.classList.add("open"); if (typeof Sound !== "undefined") Sound.whoosh(); }
    function close() { running = false; cancelAnimationFrame(raf); if (backdrop) backdrop.classList.remove("open"); }
    window.__game = open;
  })();

  /* ============================================================
     Register palette + terminal actions (extend command palette)
     ============================================================ */
  (function () {
    // add entries by listening for the palette's global if present
    // (palette reads a static list; expose quick hotkeys instead)
    window.addEventListener("keydown", function (e) {
      var tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.key === "`" && window.__terminal) { e.preventDefault(); window.__terminal(); }
    });
  })();

  /* ---- Year ---- */
  var yr = document.querySelector("#year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
