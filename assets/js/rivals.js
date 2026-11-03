/* Home: active tab follows the section in view, copy-email button. */
(function () {
  'use strict';

  var tabs = {};
  document.querySelectorAll('.tab[data-sec]').forEach(function (a) { tabs[a.getAttribute('data-sec')] = a; });
  var order = ['top', 'work', 'hire'];
  var sections = { top: document.querySelector('.hero'), work: document.getElementById('work'), hire: document.getElementById('hire') };

  function setActive(id) {
    Object.keys(tabs).forEach(function (k) { tabs[k].classList.toggle('is-active', k === id); });
  }
  function onScroll() {
    var line = window.innerHeight * 0.35, current = 'top';
    order.forEach(function (id) {
      var el = sections[id];
      if (el && el.getBoundingClientRect().top <= line) current = id;
    });
    setActive(current);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    var label = btn.textContent;
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function () { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = label; }, 1600); };
      var fallback = function () {
        var el = btn.parentNode.querySelector('.email-addr');
        if (!el) return;
        var r = document.createRange(); r.selectNodeContents(el);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        btn.textContent = 'Press Ctrl+C';
        setTimeout(function () { btn.textContent = label; }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
      else fallback();
    });
  });

  /* Stats count up once, after the band slides in. */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) {
    document.querySelectorAll('.stats b').forEach(function (el) {
      var m = /^(\d+)(.*)$/.exec(el.textContent.trim());
      if (!m) return;
      var end = parseInt(m[1], 10), suffix = m[2];
      el.textContent = '0' + suffix;
      setTimeout(function () {
        var t0 = null, dur = 1100;
        function step(ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(end * e) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }, 650);
    });
  }

  /* Scroll behaviour: condensed top bar, staggered card reveals, wedges drawing in. */
  var top = document.querySelector('.top');
  if (top) {
    var cond = function () { top.classList.toggle('is-scrolled', window.scrollY > 40); };
    window.addEventListener('scroll', cond, { passive: true });
    cond();
  }
  if (!reduce && 'IntersectionObserver' in window) {
    var root = document.documentElement;
    root.classList.add('js');
    document.querySelectorAll('.cards li .wcard').forEach(function (el, i) {
      el.classList.add('reveal'); el.style.setProperty('--d', (i * 0.12) + 's');
    });
    document.querySelectorAll('.work h2, .contact h2').forEach(function (el) { el.classList.add('reveal-h'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
    document.querySelectorAll('.reveal, .reveal-h, .wedge').forEach(function (el) { io.observe(el); });
  }
})();
