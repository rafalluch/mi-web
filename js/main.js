/* =========================================================
   rafalluch.es — JS mínimo (mejora progresiva)
   La web funciona sin este fichero. Aquí solo:
   1 Tema claro/oscuro · 2 Menú móvil · 3 Sección activa
   4 Aparición al hacer scroll · 5 Año del pie · 6 Tiempo de lectura
   ========================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var STORAGE_KEY = "theme";

  /* ---------- 1. Tema ---------- */
  function storageGet() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function storageSet(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* modo privado: se ignora */ }
  }
  function systemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var btn = document.querySelector(".theme-toggle");
    if (btn) {
      btn.setAttribute("aria-label", theme === "dark" ? "Activar tema claro" : "Activar tema oscuro");
    }
  }

  applyTheme(storageGet() || root.getAttribute("data-theme") || systemTheme());

  var themeBtn = document.querySelector(".theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      storageSet(next);
    });
  }

  // Si el usuario no ha elegido, seguimos los cambios del sistema
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: light)");
    var onChange = function () { if (!storageGet()) applyTheme(systemTheme()); };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
  }

  /* ---------- 2. Menú móvil ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menú");
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        closeNav();
        navToggle.focus();
      }
    });
  }

  /* ---------- 3. Sección activa en la navegación ---------- */
  var navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
  if ("IntersectionObserver" in window && navLinks.length) {
    var linkById = {};
    navLinks.forEach(function (a) { linkById[a.getAttribute("href").slice(1)] = a; });

    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) { a.removeAttribute("aria-current"); });
        var link = linkById[entry.target.id];
        if (link) link.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    Object.keys(linkById).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  }

  /* ---------- 4. Aparición al hacer scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- 5. Año del pie ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- 6. Tiempo de lectura (entradas) ---------- */
  var readingTime = document.querySelector("[data-reading-time]");
  var body = document.querySelector(".prose");
  if (readingTime && body) {
    var words = body.textContent.trim().split(/\s+/).length;
    var minutes = Math.max(1, Math.round(words / 200));
    readingTime.textContent = minutes + " min de lectura";
  }
})();
