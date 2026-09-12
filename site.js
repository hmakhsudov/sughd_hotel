(function () {
  'use strict';

  var reducedMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var header = document.querySelector('[data-header]');
  var prog = document.querySelector('[data-prog]');
  var parallaxEls = Array.prototype.map.call(document.querySelectorAll('[data-par]'), function (el) {
    return { el: el, k: parseFloat(el.dataset.par) || 0.1 };
  });

  var queued = false;
  function tick() {
    queued = false;
    var doc = document.documentElement;
    var max = doc.scrollHeight - innerHeight;
    var p = max > 0 ? Math.min(1, scrollY / max) : 0;
    if (prog) prog.style.width = (p * 100).toFixed(2) + '%';
    if (header) header.classList.toggle('is-scrolled', scrollY > 60);
    if (!reducedMotion) {
      var vh = innerHeight;
      parallaxEls.forEach(function (it) {
        var r = it.el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var off = (r.top + r.height / 2 - vh / 2) * it.k;
        it.el.style.transform = 'translate3d(0,' + (-off).toFixed(1) + 'px,0)';
      });
    }
  }
  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(tick);
  }
  addEventListener('scroll', onScroll, { passive: true });

  /* ---------- scroll reveal (data-rise / data-curtain / data-count) ---------- */
  function prep(el) {
    var d = parseFloat(el.dataset.d) || 0;
    el.style.transition = 'opacity .95s cubic-bezier(.16,1,.3,1) ' + d + 's,'
      + 'transform 1.05s cubic-bezier(.16,1,.3,1) ' + d + 's,'
      + 'clip-path 1.25s cubic-bezier(.16,1,.3,1) ' + d + 's';
    if (el.dataset.curtain !== undefined) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      var img = el.querySelector('[data-img]');
      if (img) {
        img.style.clipPath = 'inset(0% 0% 100% 0%)';
        img.style.transform = 'scale(1.08)';
        img.style.transition = 'clip-path 1.3s cubic-bezier(.16,1,.3,1) ' + d + 's,transform 1.5s cubic-bezier(.16,1,.3,1) ' + d + 's';
      }
    } else {
      el.style.opacity = '0';
      el.style.transform = 'translateY(32px)';
    }
  }

  function count(el) {
    if (el.dataset.mCounted) return;
    el.dataset.mCounted = '1';
    var target = parseInt(String(el.textContent).replace(/\D/g, ''), 10);
    if (!target || reducedMotion) return;
    var dur = 1200;
    var start = performance.now();
    function step(now) {
      var t = Math.max(0, Math.min(1, (now - start) / dur));
      var e = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * e));
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = String(target);
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  }

  function reveal(el) {
    if (el.dataset.curtain !== undefined) {
      var img = el.querySelector('[data-img]');
      if (img) {
        img.style.clipPath = 'inset(0% 0% 0% 0%)';
        img.style.transform = 'none';
        setTimeout(function () { img.style.transition = 'transform 1.5s cubic-bezier(.16,1,.3,1)'; }, 2000);
      }
    }
    el.style.opacity = '1';
    el.style.transform = 'none';
    if (el.dataset.count !== undefined) count(el);
    el.querySelectorAll('[data-count]').forEach(count);
  }

  var io = ('IntersectionObserver' in window && !reducedMotion)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { reveal(entry.target); io.unobserve(entry.target); }
        });
      }, { threshold: 0, rootMargin: '0px 0px -8% 0px' })
    : null;

  document.querySelectorAll('[data-rise],[data-curtain],[data-count]').forEach(function (el) {
    if (reducedMotion) return;
    prep(el);
    if (io) io.observe(el); else reveal(el);
  });

  /* ---------- mobile menu ---------- */
  var menu = document.querySelector('[data-menu]');
  document.querySelectorAll('[data-menu-toggle]').forEach(function (b) {
    b.addEventListener('click', function () { if (menu) menu.hidden = !menu.hidden; });
  });

  /* ---------- keep paired date fields (hero + contact form) in sync ---------- */
  function syncGroup(selector) {
    var els = document.querySelectorAll(selector);
    els.forEach(function (el) {
      el.addEventListener('input', function () {
        els.forEach(function (o) { if (o !== el) o.value = el.value; });
      });
    });
  }
  syncGroup('[data-checkin]');
  syncGroup('[data-checkout]');

  tick();
})();
