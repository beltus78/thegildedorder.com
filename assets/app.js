(function () {
  var T = window.I18N || {};
  function f(str, o) { return String(str).replace(/\{(\w+)\}/g, function (_, k) { return o[k] == null ? "" : o[k]; }); }
  var KEY = "gilded-cart";
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(c) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} render(); }
  function money(n) { return "$" + n.toFixed(2); }
  function count() { var n = load().reduce(function (s, i) { return s + i.qty; }, 0); document.querySelectorAll("[data-cart-count]").forEach(function (el) { el.textContent = n; }); }

  // Add to cart
  document.querySelectorAll("[data-add]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var p = JSON.parse(btn.getAttribute("data-add"));
      var qty = Math.max(1, parseInt((document.querySelector("[data-qty]") || {}).value || 1, 10));
      var sizeEl = document.querySelector("[data-size]");
      var size = sizeEl ? sizeEl.value : "";
      var c = load(), id = p.slug + (size ? "|" + size : "");
      var found = c.find(function (i) { return i.id === id; });
      if (found) found.qty += qty; else c.push({ id: id, slug: p.slug, name: p.name + (size ? " (" + T.size + " " + size + ")" : ""), price: p.price, size: size, qty: qty });
      save(c);
      btn.textContent = T.added; setTimeout(function () { btn.textContent = T.addToCart; }, 1500);
    });
  });

  // Gallery thumbs
  var main = document.querySelector("[data-main] img");
  document.querySelectorAll("[data-thumb]").forEach(function (b, i) {
    if (i === 0) b.classList.add("on");
    b.addEventListener("click", function () {
      document.querySelectorAll("[data-thumb]").forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on");
      main.classList.remove("is-ph");
      main.onerror = function () { this.onerror = null; this.src = T.placeholder; };
      main.src = b.getAttribute("data-thumb");
    });
  });

  // Sort
  var sort = document.querySelector("[data-sort]"), grid = document.querySelector("[data-grid]");
  if (sort && grid) {
    var original = Array.prototype.slice.call(grid.children);
    sort.addEventListener("change", function () {
      var items = original.slice();
      if (sort.value) items.sort(function (a, b) { var d = a.dataset.price - b.dataset.price; return sort.value === "asc" ? d : -d; });
      items.forEach(function (el) { grid.appendChild(el); });
    });
  }

  // Cart page
  function render() {
    count();
    var box = document.querySelector("[data-cart-items]"); if (!box) return;
    var c = load();
    if (!c.length) { box.innerHTML = '<p class="muted">' + f(T.cartEmpty, { shop: T.shop }) + '</p>'; }
    else box.innerHTML = c.map(function (i, idx) {
      return '<div class="cart-item"><img src="' + T.placeholder + '" alt=""><div><strong>' + i.name.replace(/</g, "&lt;") + '</strong><br><span class="muted">' + money(i.price) +
        '</span></div><div><input type="number" min="1" value="' + i.qty + '" data-idx="' + idx + '"><br><button data-rm="' + idx + '">' + T.remove + '</button></div></div>';
    }).join("");
    var total = c.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
    document.querySelector("[data-cart-total]").textContent = money(total);
    var sel = document.querySelector("[data-ship]");
    if (sel) {
      try { var saved = localStorage.getItem("gilded-ship"); if (saved) sel.value = saved; } catch (e) {}
      var r = sel.value === "US" ? T.rates.US : T.rates.INTL, ship = !c.length || total >= r.freeOver ? 0 : r.rate;
      document.querySelector("[data-ship-cost]").textContent = c.length ? (ship ? money(ship) : T.free) : "—";
      document.querySelector("[data-grand]").textContent = money(total + ship);
      if (!sel.dataset.bound) { sel.dataset.bound = 1; sel.addEventListener("change", function () { try { localStorage.setItem("gilded-ship", sel.value); } catch (e) {} render(); }); }
    }
    box.querySelectorAll("input[data-idx]").forEach(function (inp) { inp.addEventListener("change", function () { var c = load(); c[inp.dataset.idx].qty = Math.max(1, parseInt(inp.value, 10) || 1); save(c); }); });
    box.querySelectorAll("[data-rm]").forEach(function (b) { b.addEventListener("click", function () { var c = load(); c.splice(b.dataset.rm, 1); save(c); }); });
  }
  render();

  var co = document.querySelector("[data-checkout]");
  if (co) co.addEventListener("click", function () {
    var c = load(), msg = document.querySelector("[data-checkout-msg]");
    if (!c.length) { msg.textContent = T.empty; return; }
    co.disabled = true; msg.textContent = T.opening;
    fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ country: (document.querySelector("[data-ship]") || {}).value, items: c.map(function (i) { return { slug: i.slug, size: i.size, qty: i.qty }; }) }) })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d.url) location.href = d.url; else { msg.textContent = T.unavailable; co.disabled = false; } })
      .catch(function () { msg.textContent = T.unavailable; co.disabled = false; });
  });

  // Forms → WhatsApp
  var WA = T.wa;
  function openWa(text) { window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(text), "_blank", "noopener"); }
  document.querySelectorAll("[data-join]").forEach(function (jf) {
    jf.addEventListener("submit", function (e) {
      e.preventDefault();
      openWa(f(T.join, { name: jf.querySelector("input").value.trim() }));
    });
  });
  var cf = document.querySelector("[data-contact]");
  if (cf) {
    var subj = new URLSearchParams(location.search).get("subject"); if (subj) cf.querySelector("[data-subject]").value = subj;
    cf.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = Object.fromEntries(new FormData(cf));
      openWa(f(T.contact, { name: d.name, subject: d.subject ? f(T.subject, { s: d.subject }) : "", message: d.message }));
    });
  }

  // Language dropdown: close on outside click or Escape
  var dd = document.querySelector("[data-lang-dd]");
  if (dd) {
    document.addEventListener("click", function (e) { if (dd.open && !dd.contains(e.target)) dd.open = false; });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") dd.open = false; });
  }

  // Scroll reveal
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) items.forEach(function (el) { el.classList.add("in"); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }); }, { threshold: .12 });
    items.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 90 + "ms"; io.observe(el); });
  }

  // Gold dust in the hero
  var cv = document.querySelector("[data-dust]");
  if (cv && !reduce) {
    var ctx = cv.getContext("2d"), P = [], W, H;
    function size() { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; }
    size(); addEventListener("resize", size);
    for (var k = 0; k < 70; k++) P.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.8 + .4, s: Math.random() * .0006 + .0002, a: Math.random() * Math.PI * 2 });
    (function tick() {
      ctx.clearRect(0, 0, W, H);
      P.forEach(function (p) {
        p.y -= p.s; p.a += .02; if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
        ctx.beginPath(); ctx.arc(p.x * W + Math.sin(p.a) * 8, p.y * H, p.r, 0, 7);
        ctx.fillStyle = "rgba(227,197,122," + (.35 + Math.sin(p.a) * .3) + ")"; ctx.fill();
      });
      requestAnimationFrame(tick);
    })();
  }

  // Cipher
  var cipher = document.querySelector("[data-cipher]");
  if (cipher) cipher.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = cipher.querySelector("input").value.toUpperCase().replace(/[^A-Z]/g, "");
    var out = document.querySelector("[data-cipher-result]");
    out.textContent = v === atob(cipher.dataset.answer) ? T.correct : T.wrong;
  });
})();
