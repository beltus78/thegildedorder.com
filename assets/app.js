(function () {
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
      if (found) found.qty += qty; else c.push({ id: id, slug: p.slug, name: p.name + (size ? " (size " + size + ")" : ""), price: p.price, size: size, qty: qty });
      save(c);
      btn.textContent = "Added ✓"; setTimeout(function () { btn.textContent = "Add to cart"; }, 1500);
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
      main.onerror = function () { this.onerror = null; this.src = "/assets/placeholder.svg"; };
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
    if (!c.length) { box.innerHTML = '<p class="muted">Your cart is empty. <a href="/shop/">Visit the shop</a></p>'; }
    else box.innerHTML = c.map(function (i, idx) {
      return '<div class="cart-item"><img src="/assets/placeholder.svg" alt=""><div><strong>' + i.name.replace(/</g, "&lt;") + '</strong><br><span class="muted">' + money(i.price) +
        '</span></div><div><input type="number" min="1" value="' + i.qty + '" data-idx="' + idx + '"><br><button data-rm="' + idx + '">Remove</button></div></div>';
    }).join("");
    var total = c.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
    document.querySelector("[data-cart-total]").textContent = money(total);
    box.querySelectorAll("input[data-idx]").forEach(function (inp) { inp.addEventListener("change", function () { var c = load(); c[inp.dataset.idx].qty = Math.max(1, parseInt(inp.value, 10) || 1); save(c); }); });
    box.querySelectorAll("[data-rm]").forEach(function (b) { b.addEventListener("click", function () { var c = load(); c.splice(b.dataset.rm, 1); save(c); }); });
  }
  render();

  var co = document.querySelector("[data-checkout]");
  if (co) co.addEventListener("click", function () {
    var c = load(), msg = document.querySelector("[data-checkout-msg]");
    if (!c.length) { msg.textContent = "Your cart is empty."; return; }
    co.disabled = true; msg.textContent = "Opening secure checkout…";
    fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: c.map(function (i) { return { slug: i.slug, size: i.size, qty: i.qty }; }) }) })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d.url) location.href = d.url; else { msg.textContent = d.error || "Checkout is not available yet."; co.disabled = false; } })
      .catch(function () { msg.textContent = "Checkout is not available yet. Please try again soon."; co.disabled = false; });
  });

  // Forms → Pages Functions
  function post(url, data, out, ok) {
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
      .then(function (r) { out.textContent = r.ok ? ok : "Something went wrong. Please email us instead."; })
      .catch(function () { out.textContent = "Something went wrong. Please email us instead."; });
  }
  document.querySelectorAll("[data-waitlist]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var out = f.querySelector(".fine") || f.appendChild(Object.assign(document.createElement("p"), { className: "fine" }));
      post("/api/waitlist", { email: f.querySelector("input").value, tier: f.dataset.waitlist }, out, "You're on the list. Watch your inbox.");
    });
  });
  var cf = document.querySelector("[data-contact]");
  if (cf) {
    var subj = new URLSearchParams(location.search).get("subject"); if (subj) cf.querySelector("[data-subject]").value = subj;
    cf.addEventListener("submit", function (e) {
      e.preventDefault();
      post("/api/contact", Object.fromEntries(new FormData(cf)), cf.querySelector("[data-contact-msg]"), "Thank you. We'll reply within two business days.");
      cf.reset();
    });
  }

  // Cipher
  var cipher = document.querySelector("[data-cipher]");
  if (cipher) cipher.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = cipher.querySelector("input").value.toUpperCase().replace(/[^A-Z]/g, "");
    var out = document.querySelector("[data-cipher-result]");
    out.textContent = v === "GOLDISPATIENT" ? "Correct. Use code CAESAR15 for 15% off your next order." : "Not quite. Try again.";
  });
})();
