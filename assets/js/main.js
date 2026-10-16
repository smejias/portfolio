/* Santi Mejias — portfolio. No dependencies. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  root.classList.add('js');

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  /* ---------- Theme ---------- */
  var THEME_KEY = 'sm-theme';
  try {
    var saved = window.localStorage.getItem(THEME_KEY);
    if (!root.getAttribute('data-theme') && (saved === 'light' || saved === 'dark')) {
      root.setAttribute('data-theme', saved);
    }
  } catch (e) { /* storage unavailable */ }

  function effectiveTheme() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  var fadeTimer;
  doc.addEventListener('click', function (ev) {
    var btn = ev.target.closest && ev.target.closest('[data-theme-toggle]');
    if (!btn) return;
    var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    if (!reduce) {
      root.classList.add('theme-fade');
      window.clearTimeout(fadeTimer);
      fadeTimer = window.setTimeout(function () { root.classList.remove('theme-fade'); }, 520);
    }
    root.setAttribute('data-theme', next);
    btn.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
    try { window.localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
  });

  /* ---------- Copy to clipboard ---------- */
  function selectText(node) {
    if (!node || !window.getSelection) return;
    var range = doc.createRange();
    range.selectNodeContents(node);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  doc.addEventListener('click', function (ev) {
    var btn = ev.target.closest && ev.target.closest('[data-copy]');
    if (!btn) return;
    var text = btn.getAttribute('data-copy');
    var box = btn.closest('.email-box');
    var target = box && box.querySelector('.addr, a');
    var status = box && box.querySelector('.copy-status');
    if (box && !status) {
      status = doc.createElement('span');
      status.className = 'copy-status';
      status.setAttribute('role', 'status');
      box.appendChild(status);
    }

    function done(ok) {
      var msg = ok ? 'Copied' : 'Press Ctrl+C';
      if (status) status.textContent = msg;
      $$('.slip', btn).forEach(function (n) { n.remove(); });
      var slip = doc.createElement('span');
      slip.className = 'slip' + (ok ? '' : ' slip--hint');
      slip.setAttribute('aria-hidden', 'true');
      slip.textContent = msg;
      btn.appendChild(slip);
      window.setTimeout(function () { slip.remove(); if (status) status.textContent = ''; }, reduce ? 1600 : 1900);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () {
        selectText(target); done(false);
      });
    } else {
      selectText(target); done(false);
    }
  });

  /* ---------- Image slots ---------- */
  var EXTS = ['jpg', 'png', 'webp', 'jpeg', 'avif'];

  function markOk(img) {
    img.classList.add('ok');
    var fig = img.closest('.shot');
    if (fig) {
      fig.classList.add('has-img');
      var fr = img.closest('.shot-frame');
      if (fr && !fr.closest('a') && !fig.classList.contains('shot--video') && !fr.hasAttribute('tabindex')) {
        fr.setAttribute('tabindex', '0');
        fr.setAttribute('role', 'button');
        fr.setAttribute('aria-label', 'Enlarge image: ' + (img.alt || 'screenshot'));
      }
    }
  }

  function initSlots(scope) {
    $$('img[data-base]', scope).forEach(function (img) {
      if (img.__slot) return;
      img.__slot = true;
      var base = img.getAttribute('data-base');
      var idx = 0;
      function tryNext() {
        idx += 1;
        if (idx < EXTS.length) { img.src = base + '.' + EXTS[idx]; }
        else { img.removeAttribute('src'); img.classList.remove('ok'); }
      }
      img.addEventListener('load', function () { if (img.naturalWidth > 0) markOk(img); });
      img.addEventListener('error', tryNext);
      if (img.complete && img.naturalWidth > 0) markOk(img);
    });
  }

  /* Lightbox for loaded images: keyboard, counter, handwritten caption */
  var dlg, stage, bigImg, capEl, countEl, prevBtn, nextBtn, list = [], pos = 0, opener = null;

  function galleryOf(img) {
    var scope = img.closest('.gallery') || img.closest('.shot');
    var imgs = scope ? $$('.shot.has-img:not(.shot--video) img.ok', scope.classList.contains('gallery') ? scope : scope.parentNode) : [];
    return imgs.indexOf(img) < 0 ? [img] : imgs;
  }

  function showAt(i, dir) {
    pos = (i + list.length) % list.length;
    var img = list[pos];
    var fig = img.closest('.shot');
    bigImg.src = img.currentSrc || img.src;
    bigImg.alt = img.alt || '';
    stage.classList.toggle('tall', img.naturalHeight > img.naturalWidth * 1.8);
    stage.scrollTop = 0;
    var cap = fig && fig.querySelector('figcaption');
    capEl.textContent = cap ? cap.textContent : '';
    capEl.hidden = !cap;
    countEl.textContent = list.length > 1 ? (pos + 1) + ' / ' + list.length : '';
    prevBtn.hidden = nextBtn.hidden = list.length < 2;
    $$('.annot', stage).forEach(function (n) { n.remove(); });
    var ann = fig && fig.querySelector('.annot');
    if (ann) {
      var c = ann.cloneNode(true);
      stage.appendChild(c);
      window.setTimeout(function () { c.classList.add('in'); }, reduce ? 0 : 350);
    }
    if (!reduce && dir) {
      stage.classList.remove('go-next', 'go-prev');
      void stage.offsetWidth;
      stage.classList.add(dir > 0 ? 'go-next' : 'go-prev');
    }
    [list[(pos + 1) % list.length], list[(pos - 1 + list.length) % list.length]].forEach(function (n) {
      if (n) (new Image()).src = n.currentSrc || n.src;
    });
  }

  function openLightbox(img) {
    if (typeof HTMLDialogElement === 'undefined') return;
    if (!dlg) {
      dlg = doc.createElement('dialog');
      dlg.className = 'lightbox';
      dlg.setAttribute('aria-label', 'Image viewer');
      dlg.setAttribute('tabindex', '-1');
      dlg.innerHTML =
        '<div class="lb-stage"><img alt=""></div>' +
        '<div class="lb-bar"><p class="lb-cap"></p><span class="lb-count" aria-live="polite"></span></div>' +
        '<button type="button" class="lb-nav lb-prev" aria-label="Previous image">←</button>' +
        '<button type="button" class="lb-nav lb-next" aria-label="Next image">→</button>' +
        '<button type="button" class="lb-close" aria-label="Close">✕</button>';
      stage = dlg.querySelector('.lb-stage');
      bigImg = dlg.querySelector('img');
      capEl = dlg.querySelector('.lb-cap');
      countEl = dlg.querySelector('.lb-count');
      prevBtn = dlg.querySelector('.lb-prev');
      nextBtn = dlg.querySelector('.lb-next');
      dlg.addEventListener('click', function (ev) {
        if (ev.target === prevBtn) { showAt(pos - 1, -1); return; }
        if (ev.target === nextBtn) { showAt(pos + 1, 1); return; }
        dlg.close();
      });
      dlg.addEventListener('keydown', function (ev) {
        if (list.length < 2) return;
        if (ev.key === 'ArrowLeft') { ev.preventDefault(); showAt(pos - 1, -1); }
        else if (ev.key === 'ArrowRight') { ev.preventDefault(); showAt(pos + 1, 1); }
      });
      dlg.addEventListener('close', function () {
        if (opener && opener.focus) opener.focus({ preventScroll: true });
      });
      doc.body.appendChild(dlg);
    }
    opener = doc.activeElement && doc.activeElement !== doc.body ? doc.activeElement : null;
    list = galleryOf(img);
    showAt(list.indexOf(img), 0);
    if (!dlg.open) dlg.showModal();
    dlg.focus({ preventScroll: true });
  }

  doc.addEventListener('click', function (ev) {
    var frame = ev.target.closest && ev.target.closest('.shot.has-img .shot-frame');
    if (!frame) return;
    if (frame.closest('a')) return;
    var img = frame.querySelector('img.ok');
    if (img) openLightbox(img);
  });

  doc.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    var frame = ev.target.classList && ev.target.classList.contains('shot-frame') ? ev.target : null;
    if (!frame || !frame.closest('.shot.has-img') || frame.closest('a')) return;
    var img = frame.querySelector('img.ok');
    if (img) { ev.preventDefault(); openLightbox(img); }
  });

  /* ---------- Reveal on scroll ---------- */
  function initReveal(scope) {
    var els = $$('[data-reveal]', scope).filter(function (el) { return !el.__rv; });
    els.forEach(function (el) { el.__rv = true; });
    if (reduce || !hasIO) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

    els.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.96) { el.classList.add('in'); return; }
      el.classList.add('pre');
      io.observe(el);
    });
  }

  /* ---------- Highlight draw-in ---------- */
  function initMarks(scope) {
    var els = $$('mark', scope).filter(function (el) { return !el.__mk; });
    els.forEach(function (el) { el.__mk = true; });
    if (reduce || !hasIO) { els.forEach(function (el) { el.classList.add('in'); }); return; }

    /* Marks that share a sentence (systems/narrative, say) draw one after another
       instead of both snapping in at once. */
    var prevParent = null, idx = 0;
    els.forEach(function (el) {
      if (el.parentElement !== prevParent) { prevParent = el.parentElement; idx = 0; }
      el.style.transitionDelay = (idx * 0.15) + 's';
      idx += 1;
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

    els.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.96) { el.classList.add('in'); return; }
      io.observe(el);
    });
  }

  /* ---------- Card tilt ---------- */
  var CAN_HOVER = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function initTilt(scope) {
    if (reduce || !CAN_HOVER) return;
    var els = $$('.stage-card, .principles li, .games li, .koster', scope).filter(function (el) { return !el.__tilt; });
    els.forEach(function (el) {
      el.__tilt = true;
      el.classList.add('tilt');
      var frame = 0;
      el.addEventListener('mousemove', function (ev) {
        if (frame) return;
        frame = window.requestAnimationFrame(function () {
          frame = 0;
          var r = el.getBoundingClientRect();
          var px = (ev.clientX - r.left) / r.width;
          var py = (ev.clientY - r.top) / r.height;
          var rx = (0.5 - py) * 7;
          var ry = (px - 0.5) * 9;
          el.style.transition = 'none';
          el.style.transform = 'perspective(700px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
        });
      });
      el.addEventListener('mouseleave', function () {
        el.style.transition = '';
        el.style.transform = '';
      });
    });
  }

  /* ---------- Stroke drawing + flows ---------- */
  function initDraw(scope) {
    var els = $$('.draw, .flow', scope).filter(function (el) { return !el.__dr; });
    els.forEach(function (el) { el.__dr = true; });
    if (reduce || !hasIO) { els.forEach(function (el) { el.classList.add('in'); }); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.22 });

    els.forEach(function (el) {
      if (el.hasAttribute('data-draw-now')) {
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () { el.classList.add('in'); });
        });
      } else {
        io.observe(el);
      }
    });
  }

  /* ---------- Counters ---------- */
  function initCounters(scope) {
    var els = $$('[data-count]', scope).filter(function (el) { return !el.__ct; });
    els.forEach(function (el) { el.__ct = true; });
    if (reduce || !hasIO) return;

    function suffixOf(el) { return el.getAttribute('data-suffix') || ''; }
    function finalText(el) { return el.getAttribute('data-count') + suffixOf(el); }

    function run(el) {
      var end = parseFloat(el.getAttribute('data-count'));
      var t0 = null, dur = 1100;
      function frame(t) {
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * eased) + suffixOf(el);
        if (p < 1) window.requestAnimationFrame(frame);
      }
      window.requestAnimationFrame(frame);
    }

    /* Every counter starts at zero and counts up exactly once. The ones already on screen at
       load used to be skipped (so on a desktop-sized window the strip never moved); now they
       count a moment after load, one after another. The ones below the fold wait until they are
       mostly in view. The real number stays in data-count and is restored for printing. */
    els.forEach(function (el) { el.textContent = '0' + suffixOf(el); });
    window.addEventListener('beforeprint', function () { els.forEach(function (el) { el.textContent = finalText(el); }); });

    var onScreen = els.filter(function (el) { return el.getBoundingClientRect().top < window.innerHeight * 0.98; });
    var below = els.filter(function (el) { return onScreen.indexOf(el) === -1; });

    onScreen.forEach(function (el, i) { window.setTimeout(function () { run(el); }, 450 + i * 130); });

    var io = new IntersectionObserver(function (entries) {
      var hit = entries.filter(function (e) { return e.isIntersecting; });
      hit.forEach(function (e, i) {
        io.unobserve(e.target);
        window.setTimeout(function () { run(e.target); }, i * 130);
      });
    }, { threshold: 0.6 });
    below.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Project tag stamps ---------- */
  /* The tags in a project's header stamp down once, in order, the first time they scroll into view. */
  function initStamps(scope) {
    var els = $$('.hero-card .tag, .work .tags .tag, .t-roles .tag', scope).filter(function (el) { return !el.__st; });
    els.forEach(function (el) {
      el.__st = true;
      var i = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty('--stamp-delay', (0.25 + i * 0.14) + 's');
    });
    if (reduce || !hasIO) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Table of contents: current section + ruler needle ---------- */
  /* Marks the section you are reading (aria-current) and, on wide screens where the index is a
     ruler, slides the orange needle along it. The needle sits on a link's tick when that section
     reaches the reading line and moves toward the next tick as the section scrolls past, so it
     doubles as a reading-progress bar. The reading line is 28% down the viewport. */
  function initToc(scope) {
    var toc = $('[data-toc]', scope);
    if (!toc || toc.__ts) return;
    toc.__ts = true;
    var items = [];
    $$('a[href^="#"]', toc).forEach(function (a) {
      var id = a.getAttribute('data-target') || a.getAttribute('href').slice(1);
      var el = doc.getElementById(id);
      if (el) items.push({ a: a, el: el });
    });
    if (!items.length) return;
    var wide = window.matchMedia ? window.matchMedia('(min-width: 960px)') : { matches: false };
    var pending = false;

    function update() {
      pending = false;
      var ref = window.innerHeight * 0.28;
      var cur = -1;
      for (var k = 0; k < items.length; k++) {
        if (items[k].el.getBoundingClientRect().top <= ref) cur = k; else break;
      }
      items.forEach(function (it, k) {
        if (k === cur) it.a.setAttribute('aria-current', 'true');
        else it.a.removeAttribute('aria-current');
      });
      if (!wide.matches) { toc.style.removeProperty('--toc-y'); return; }

      var top = toc.getBoundingClientRect().top;
      var centers = items.map(function (it) {
        var r = it.a.getBoundingClientRect();
        return r.top + r.height / 2 - top;
      });
      /* The rhythm pass nudges link text a few px so it rests on the paper rules. The ruler ticks
         follow the same nudge, so each major tick stays level with its link. */
      var shift = centers[0] - (items[0].a.offsetTop + items[0].a.offsetHeight / 2);
      toc.style.setProperty('--toc-shift', shift.toFixed(1) + 'px');
      var i = Math.max(cur, 0);
      var start = items[i].el.getBoundingClientRect().top;
      var end = i + 1 < items.length ? items[i + 1].el.getBoundingClientRect().top : items[i].el.getBoundingClientRect().bottom;
      var f = cur < 0 || end <= start ? 0 : Math.min(1, Math.max(0, (ref - start) / (end - start)));
      var next = i + 1 < items.length ? centers[i + 1] : centers[i] + cellSize() / 2;
      toc.style.setProperty('--toc-y', (centers[i] + f * (next - centers[i])).toFixed(1) + 'px');
    }

    function schedule() {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(update);
    }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('load', schedule);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { schedule(); window.setTimeout(schedule, 400); });
    schedule();
  }

  /* Project pages: once the hero card scrolls away, the sticky Project File card grows a header
     (key art + game title) so you always know which game you are reading about. */
  function initProjectStick(scope) {
    var hero = scope.querySelector('.page-head--card .hero-card');
    var side = scope.querySelector('.p-layout .p-side');
    if (!side || side.querySelector('.pf-head')) return;
    var title = hero && hero.querySelector('h1') ? hero.querySelector('h1').textContent : side.getAttribute('data-pf-title');
    if (!title || (hero && !('IntersectionObserver' in window))) return;
    var head = doc.createElement('div');
    head.className = 'pf-head';
    head.setAttribute('aria-hidden', 'true');
    head.style.cssText = (hero ? hero.closest('.page-head') : side).getAttribute('style') || '';
    var t = doc.createElement('span');
    t.textContent = title;
    head.appendChild(t);
    side.insertBefore(head, side.firstChild);
    if (!hero) { side.classList.add('is-stuck'); return; } /* pages without a hero card: header always on */
    new IntersectionObserver(function (e) {
      var r = e[0];
      side.classList.toggle('is-stuck', !r.isIntersecting && r.boundingClientRect.bottom < 0);
    }).observe(hero);
  }

  /* ---------- Public init (also used by the single-file preview) ---------- */
  /* ---------- Rhythm ----------
     The paper behind the page is ruled every --u pixels (28). The CSS gives every line of
     text on the paper a line-height of one cell and every gap a whole number of cells.
     This pass does what CSS cannot:
       1. It rounds the height of boxes (cards, figures, diagrams) up to whole cells, so the
          text that follows starts on a rule again.
       2. It rests the baseline of each text block just above its rule. Fonts put their
          baseline at different heights inside the same line box, so each block gets a small
          `translate`, which never changes the layout.
     Text inside boxes with a solid background hides the rules, so it is left alone. */

  var SNAP = '.work, .teaser, .hero-card, .quote, .pull, .koster, .facts, .principles li, .stage-card, ' +
             '.games li, .t-card, .avail, .contact-cta, .stats, .polaroid, .shot-frame, .vid, .cta-band, .email-box';
  var BASELINE_GAP = 2;   /* px between a baseline and the rule under it */
  var nudged = [];

  function cellSize() {
    var v = parseFloat(getComputedStyle(root).getPropertyValue('--u'));
    return v > 0 ? v : 28;
  }

  function isRendered(el) { return el.getClientRects().length > 0; }

  function depthOf(el) {
    var d = 0;
    while (el.parentElement) { d += 1; el = el.parentElement; }
    return d;
  }

  function snapBoxes(u) {
    var els = $$(SNAP).filter(isRendered);
    els.forEach(function (el) { el.style.minHeight = ''; });
    els.map(function (el) { return { el: el, d: depthOf(el) }; })
      .sort(function (a, b) { return b.d - a.d; })
      .forEach(function (o) {
        var h = o.el.offsetHeight;
        var target = Math.ceil((h - 0.5) / u) * u;
        if (target > h) o.el.style.minHeight = target + 'px';
      });
  }

  function paintsBackground(el) {
    var bg = getComputedStyle(el).backgroundColor;
    var m = bg.match(/rgba?\(([^)]+)\)/);
    if (m) {
      var p = m[1].split(',');
      return (p.length > 3 ? parseFloat(p[3]) : 1) > 0.3;
    }
    /* color-mix() and friends compute to color(srgb r g b / a) */
    var c = bg.match(/^color\(.*?(?:\/\s*([\d.]+%?))?\)$/);
    if (!c) return false;
    var al = c[1] === undefined ? 1 : (/%$/.test(c[1]) ? parseFloat(c[1]) / 100 : parseFloat(c[1]));
    return al > 0.3;
  }

  function onPaper(el) {
    for (var n = el; n && n !== doc.body && n !== root; n = n.parentElement) {
      if (paintsBackground(n)) return false;
    }
    return true;
  }

  function isTilted(el) {
    for (var n = el; n && n !== doc.body; n = n.parentElement) {
      if (getComputedStyle(n).transform !== 'none') return true;
    }
    return false;
  }

  function textOwners() {
    var owners = [];
    var seen = [];
    $$('main, footer').filter(isRendered).forEach(function (area) {
      var walker = doc.createTreeWalker(area, NodeFilter.SHOW_TEXT, null);
      var tn;
      while ((tn = walker.nextNode())) {
        if (!/\S/.test(tn.nodeValue)) continue;
        var el = tn.parentElement;
        if (!el || el.closest('svg, script, style, [hidden], [aria-hidden="true"]')) continue;
        var owner = el;
        while (owner && /^inline|^contents/.test(getComputedStyle(owner).display)) owner = owner.parentElement;
        if (!owner || seen.indexOf(owner) !== -1) continue;
        seen.push(owner);
        var display = getComputedStyle(owner).display;
        if (/flex|grid/.test(display) && owner === el) continue;   /* anonymous flex item */
        if (!isRendered(owner) || !onPaper(el) || isTilted(el)) continue;
        if (owner.parentElement && owner.parentElement.classList.contains('cta-row')) continue;  /* sits beside buttons */
        if (owner.matches('.side-block h2')) continue;  /* small caps label: the 28px nudge would push it into the chips below */
        owners.push({ el: owner, node: tn });
      }
    });
    return owners;
  }

  function nudgeText(u) {
    nudged.forEach(function (el) { el.style.translate = ''; });
    nudged = [];
    var owners = textOwners();

    /* One layout pass: drop a zero-size marker on each baseline, read them all, remove them. */
    var probes = owners.map(function (o) {
      var probe = doc.createElement('span');
      probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
      o.node.parentNode.insertBefore(probe, o.node);
      return probe;
    });
    var scrollY = window.pageYOffset;
    var baselines = probes.map(function (p) { return p.getBoundingClientRect().bottom + scrollY; });
    probes.forEach(function (p) { p.parentNode.removeChild(p); });

    var applied = [];
    owners.forEach(function (o, i) {
      var inherited = 0;
      for (var a = o.el.parentElement; a; a = a.parentElement) {
        var k = nudged.indexOf(a);
        if (k !== -1) inherited += applied[k];
      }
      var d = (u - BASELINE_GAP - (baselines[i] + inherited)) % u;
      if (d < 0) d += u;
      if (d > u / 2) d -= u;
      d = Math.round(d * 100) / 100;
      nudged.push(o.el);
      applied.push(d);
      if (d !== 0) o.el.style.translate = '0 ' + d + 'px';
    });
  }

  function rhythm() {
    var u = cellSize();
    root.classList.add('rhythm-measuring');
    snapBoxes(u);
    nudgeText(u);
    root.classList.remove('rhythm-measuring');
    window.__rhythmRuns = (window.__rhythmRuns || 0) + 1;
  }

  var rhythmFrame = 0;
  function scheduleRhythm() {
    if (rhythmFrame) window.cancelAnimationFrame(rhythmFrame);
    rhythmFrame = window.requestAnimationFrame(function () { rhythmFrame = 0; rhythm(); });
  }

  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(scheduleRhythm, 120);
  });
  window.addEventListener('load', scheduleRhythm);
  if (doc.fonts) {
    if (doc.fonts.ready) doc.fonts.ready.then(function () {
      /* The ready promise can resolve a frame or two before the swapped font actually
         repaints, so measuring right away sometimes reads stale (pre-swap) metrics.
         A second pass shortly after catches that race. */
      scheduleRhythm();
      window.setTimeout(scheduleRhythm, 250);
    });
    if (doc.fonts.addEventListener) doc.fonts.addEventListener('loadingdone', scheduleRhythm);
  }

  /* ---------- Public init (also used by the single-file preview) ---------- */
  function init(scope) {
    scope = scope || doc;
    initSlots(scope);
    initReveal(scope);
    initMarks(scope);
    initTilt(scope);
    initDraw(scope);
    initCounters(scope);
    initStamps(scope);
    initProjectStick(scope);
    initToc(scope);
    scheduleRhythm();
  }

  window.Portfolio = { init: init, rhythm: rhythm };

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', function () { if (!window.__previewRouter) init(doc); });
  else if (!window.__previewRouter) init(doc);
})();
