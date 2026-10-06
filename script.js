(function () {
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Light / dark toggle ---------- */
  function isDark() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  document.querySelector('.theme-toggle').addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    links.classList.toggle('is-open', open);
  }
  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  links.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });

  /* ---------- Header border on scroll ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal + active nav link ---------- */
  if ('IntersectionObserver' in window) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(function (el) {
      // Stagger siblings slightly so grids cascade in
      var siblings = el.parentElement ? el.parentElement.querySelectorAll(':scope > .reveal') : [];
      var idx = Array.prototype.indexOf.call(siblings, el);
      if (idx > 0) el.style.transitionDelay = Math.min(idx * 70, 350) + 'ms';
      revealer.observe(el);
    });

    var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { spy.observe(s); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Publication filters ---------- */
  var chips = document.querySelectorAll('.filters .chip');
  var pubs = document.querySelectorAll('.pub');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      chips.forEach(function (c) { c.classList.toggle('is-active', c === chip); });
      pubs.forEach(function (p) {
        p.hidden = !(f === 'all' || p.getAttribute('data-type') === f);
        if (!p.hidden) p.classList.add('is-visible');
      });
    });
  });

  /* ---------- Hero network animation ---------- */
  var canvas = document.querySelector('.hero-canvas');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var hero = canvas.parentElement;
  var nodes = [], w = 0, h = 0, dpr = 1, raf = null, running = false;
  var mouse = { x: -9999, y: -9999 };

  function color(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth; h = hero.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var count = Math.round(Math.min(70, (w * h) / 16000));
    nodes = [];
    for (var i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.8 + 1, warm: Math.random() < 0.18
      });
    }
    if (!running) draw();
  }

  function draw() {
    var accent = color('--accent'), warm = color('--warm');
    var linkDist = Math.min(150, w / 7);
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i];
      for (var j = i + 1; j < nodes.length; j++) {
        var b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < linkDist) {
          ctx.globalAlpha = (1 - d / linkDist) * 0.22;
          ctx.strokeStyle = accent;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (var k = 0; k < nodes.length; k++) {
      var n = nodes[k];
      var md = Math.hypot(n.x - mouse.x, n.y - mouse.y);
      ctx.globalAlpha = md < 120 ? 0.9 : 0.5;
      ctx.fillStyle = n.warm ? warm : accent;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r + (md < 120 ? 1 : 0), 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function step() {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      // Gentle drift away from the cursor
      var dx = n.x - mouse.x, dy = n.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 120 && d > 0) { n.x += (dx / d) * 0.6; n.y += (dy / d) * 0.6; }
      n.x += n.vx; n.y += n.vy;
      if (n.x < -10) n.x = w + 10; else if (n.x > w + 10) n.x = -10;
      if (n.y < -10) n.y = h + 10; else if (n.y > h + 10) n.y = -10;
    }
    draw();
    raf = requestAnimationFrame(step);
  }

  function start() { if (!running && !reduceMotion) { running = true; raf = requestAnimationFrame(step); } }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

  hero.addEventListener('pointermove', function (e) {
    var r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  hero.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });

  // Only animate while the hero is on screen
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }).observe(hero);
  } else {
    start();
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });
  // Redraw in the new palette when the theme changes
  new MutationObserver(function () { if (!running) draw(); })
    .observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  resize();
})();
