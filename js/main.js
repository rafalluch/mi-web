/* =========================================================
   rafalluch.es — JS con mejora progresiva
   La web se ve y funciona completa sin este fichero.
   1 Tema · 2 Cabecera cristal · 3 Menú móvil · 4 Sección activa
   5 Aparición · 6 Terminal · 7 Spotlight · 8 Línea de tiempo
   9 Copiar email · 10 Año · 11 Tiempo de lectura
   ========================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var mq = function (q) { return window.matchMedia ? window.matchMedia(q) : { matches: false }; };
  var reduceMotion = mq("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Tema ---------- */
  var KEY = "theme";
  function getStored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function store(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* sin almacenamiento */ } }
  function systemTheme() { return mq("(prefers-color-scheme: light)").matches ? "light" : "dark"; }

  var themeBtn = document.querySelector(".theme-toggle");
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    if (themeBtn) themeBtn.setAttribute("aria-label", t === "dark" ? "Activar tema claro" : "Activar tema oscuro");
  }
  applyTheme(getStored() || root.getAttribute("data-theme") || systemTheme());
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      store(next);
    });
  }
  var schemeMq = mq("(prefers-color-scheme: light)");
  if (schemeMq.addEventListener) {
    schemeMq.addEventListener("change", function () { if (!getStored()) applyTheme(systemTheme()); });
  }

  /* ---------- 2. Cabecera de cristal al hacer scroll ---------- */
  var header = document.querySelector(".site-header");
  function onScrollHeader() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 8); }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------- 3. Menú móvil ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  function setNav(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  }
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () { setNav(!nav.classList.contains("is-open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setNav(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setNav(false); navToggle.focus(); }
    });
  }

  /* ---------- 4. Sección activa ---------- */
  var navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
  if ("IntersectionObserver" in window && navLinks.length) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.removeAttribute("aria-current"); });
        if (byId[en.target.id]) byId[en.target.id].setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(byId).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) secObs.observe(s);
    });
  }

  /* ---------- 5. Aparición (300 ms, nunca se queda a medias) ---------- */
  var reveals = document.querySelectorAll(".reveal");
  function showAll() { reveals.forEach(function (el) { el.classList.add("is-visible"); }); }
  if (reduceMotion || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    var revObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); obs.unobserve(en.target); }
      });
    }, { threshold: 0, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("is-visible");
      else revObs.observe(el);
    });
    // Al imprimir o saltar con un ancla, todo visible
    window.addEventListener("beforeprint", showAll);
    window.addEventListener("hashchange", showAll);
  }

  /* ---------- 6. Terminal que escribe (solo visual) ---------- */
  var typed = document.querySelector("[data-typewriter]");
  if (typed && !reduceMotion) {
    var full = typed.textContent;
    typed.textContent = "";
    var i = 0;
    (function type() {
      typed.textContent = full.slice(0, ++i);
      if (i < full.length) setTimeout(type, 38 + Math.random() * 40);
    })();
  }

  /* ---------- 7. Spotlight en el bento (solo puntero fino) ---------- */
  if (!reduceMotion && mq("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".tile").forEach(function (tile) {
      tile.addEventListener("pointermove", function (e) {
        var r = tile.getBoundingClientRect();
        tile.style.setProperty("--mx", (e.clientX - r.left) + "px");
        tile.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- 8. Línea de tiempo que se rellena ---------- */
  var timeline = document.querySelector(".timeline");
  if (timeline && !reduceMotion) {
    var ticking = false;
    var update = function () {
      var r = timeline.getBoundingClientRect();
      var start = window.innerHeight * 0.75;
      var p = (start - r.top) / r.height;
      timeline.style.setProperty("--progress", Math.max(0, Math.min(1, p)).toFixed(3));
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- 9. Copiar email ---------- */
  var copyBtn = document.querySelector(".copy-btn");
  var copyStatus = document.querySelector(".copy-status");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var email = copyBtn.getAttribute("data-email");
      var done = function (ok) {
        if (copyStatus) copyStatus.textContent = ok ? "Email copiado al portapapeles" : "No se pudo copiar: " + email;
        setTimeout(function () { if (copyStatus) copyStatus.textContent = ""; }, 4000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(function () { done(true); }, function () { done(false); });
      } else {
        done(false);
      }
    });
  }

  /* ---------- 10. Año del pie ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- 11. Tiempo de lectura ---------- */
  var rt = document.querySelector("[data-reading-time]");
  var prose = document.querySelector(".prose");
  if (rt && prose) {
    var words = prose.textContent.trim().split(/\s+/).length;
    rt.textContent = Math.max(1, Math.round(words / 200)) + " min de lectura";
  }
})();
