/* Home carousel. One view per section, scroll-snap does the moving.
   Ways to move: bottom tabs, arrows, keyboard (left/right, Home/End), mouse wheel,
   trackpad or finger swipe, links to #work and friends, and the URL hash.
   If the browser has no scroll-snap or the script fails, index.html is still a normal page,
   because the deck CSS only applies once <html> has .deck-on. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement, body = doc.body;
  var track = doc.getElementById('deck-track');
  if (!track) { root.classList.remove('deck-on'); return; }

  var views = Array.prototype.slice.call(track.querySelectorAll('.view')).filter(function (v) { return !v.hidden; });
  var N = views.length;
  var header = doc.querySelector('.site-header');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var current = 0, bar, tabs = [], prevBtn, nextBtn, countCur, countLabel, hashTimer = 0, wheelLock = 0;

  function cell() {
    var v = parseFloat(getComputedStyle(root).getPropertyValue('--u'));
    return v > 0 ? v : 28;
  }

  /* The deck is a whole number of ruled cells tall; the bar takes the rest. */
  function size() {
    var u = cell();
    var free = window.innerHeight - header.offsetHeight - u * 2;
    var h = Math.max(u * 10, Math.floor(free / u) * u);
    root.style.setProperty('--deck-h', h + 'px');
  }

  function idxOf(id) {
    for (var i = 0; i < N; i += 1) if (views[i].id === id) return i;
    return -1;
  }

  function build() {
    var wrap = doc.createElement('div');
    wrap.className = 'wrap';
    prevBtn = doc.createElement('button');
    prevBtn.type = 'button'; prevBtn.className = 'deck-arrow'; prevBtn.textContent = '←';
    prevBtn.setAttribute('aria-label', 'Previous section');
    nextBtn = doc.createElement('button');
    nextBtn.type = 'button'; nextBtn.className = 'deck-arrow'; nextBtn.textContent = '→';
    nextBtn.setAttribute('aria-label', 'Next section');

    var list = doc.createElement('ol');
    list.className = 'deck-tabs';
    views.forEach(function (v, i) {
      var label = v.getAttribute('data-label') || v.id;
      v.setAttribute('role', 'group');
      v.setAttribute('aria-roledescription', 'slide');
      v.setAttribute('aria-label', (i + 1) + ' of ' + N + ': ' + label);
      var li = doc.createElement('li');
      var b = doc.createElement('button');
      b.type = 'button'; b.className = 'deck-tab'; b.textContent = label;
      b.addEventListener('click', function () { go(i); });
      li.appendChild(b); list.appendChild(li); tabs.push(b);
    });

    var count = doc.createElement('p');
    count.className = 'deck-count';
    count.setAttribute('aria-hidden', 'true');
    countCur = doc.createElement('span');
    countLabel = doc.createElement('span');
    count.appendChild(countCur);
    count.appendChild(doc.createTextNode(' / ' + N + ' · '));
    count.appendChild(countLabel);

    wrap.appendChild(prevBtn); wrap.appendChild(list); wrap.appendChild(count); wrap.appendChild(nextBtn);
    bar = doc.createElement('nav');
    bar.className = 'deck-nav';
    bar.setAttribute('aria-label', 'Sections');
    bar.appendChild(wrap);
    track.parentNode.parentNode.insertBefore(bar, track.parentNode.nextSibling);

    prevBtn.addEventListener('click', function () { go(current - 1); });
    nextBtn.addEventListener('click', function () { go(current + 1); });
  }

  function go(i, instant) {
    i = Math.max(0, Math.min(N - 1, i));
    track.scrollTo({ left: i * track.clientWidth, behavior: (instant || reduce.matches) ? 'auto' : 'smooth' });
    if (instant) setActive(i);
  }

  function setActive(i) {
    if (i === current && tabs[i].getAttribute('aria-current') === 'true') return;
    current = i;
    tabs.forEach(function (t, k) {
      if (k === i) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current');
    });
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === N - 1;
    countCur.textContent = String(i + 1);
    countLabel.textContent = views[i].getAttribute('data-label') || views[i].id;
    root.setAttribute('data-view', views[i].id);
    window.clearTimeout(hashTimer);
    hashTimer = window.setTimeout(function () {
      var h = i === 0 ? location.pathname + location.search : '#' + views[i].id;
      try { history.replaceState(null, '', h); } catch (e) { /* sandboxed frames may refuse */ }
    }, 160);
  }

  var frame = 0;
  track.addEventListener('scroll', function () {
    if (frame) return;
    frame = window.requestAnimationFrame(function () {
      frame = 0;
      setActive(Math.max(0, Math.min(N - 1, Math.round(track.scrollLeft / track.clientWidth))));
    });
  }, { passive: true });

  /* Mouse wheel moves one view per gesture, unless the view itself still has content to scroll. */
  track.addEventListener('wheel', function (e) {
    if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY) || Math.abs(e.deltaY) < 8) return;
    var v = views[current];
    if (v.scrollHeight > v.clientHeight + 1) {
      var top = v.scrollTop <= 0, end = v.scrollTop + v.clientHeight >= v.scrollHeight - 1;
      if ((e.deltaY > 0 && !end) || (e.deltaY < 0 && !top)) return;
    }
    e.preventDefault();
    var now = Date.now();
    if (now < wheelLock) return;
    wheelLock = now + 750;
    go(current + (e.deltaY > 0 ? 1 : -1));
  }, { passive: false });

  doc.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (doc.querySelector('dialog[open]')) return;
    var t = e.target;
    if (t && t.closest && t.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (e.key === 'ArrowRight') go(current + 1);
    else if (e.key === 'ArrowLeft') go(current - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(N - 1);
    else return;
    e.preventDefault();
  });

  /* Links to a view (#work, index.html#work) move the deck instead of jumping the page. */
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
    var m = a.getAttribute('href').match(/^(?:index\.html)?#([\w-]+)$/);
    if (!m) return;
    var i = idxOf(m[1]);
    if (i < 0) return;
    e.preventDefault();
    go(i);
  });

  window.addEventListener('hashchange', function () {
    var i = idxOf(location.hash.slice(1));
    if (i >= 0) go(i);
  });

  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () { size(); go(current, true); }, 60);
  });

  build();
  size();
  var start = idxOf(location.hash.slice(1));
  go(start > 0 ? start : 0, true);
  if (start <= 0) setActive(0);
  root.classList.add('deck-ready');
})();
