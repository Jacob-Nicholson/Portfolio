/* Page dock (the dot navigation), on the home page and the case studies.

   Jumping: tapping a dot used to leave the jump to the browser's anchor
   scrolling, which runs a smooth scroll while `scroll-snap-type: mandatory`
   keeps pulling the page to the nearest snap point. On phones (iOS Safari
   especially) the two fight: the page can stop at the wrong chapter or
   rubber-band back and forth. So a dot now (1) switches snapping off,
   (2) glides to the exact spot that chapter snaps to, (3) pins the page on
   that spot once the glide stops, and (4) leaves snapping off until the
   reader next touches, scrolls or presses a key. Turning it back on the
   moment the glide ended let iOS treat the end of the glide as a flick and
   carry on one chapter further.

   Case studies also get:
   - the chapter highlight: the dot for the section in view turns dark grey,
     whether the reader scrolls there or taps the dot
   - arrival at the top: a page opened without a #section starts at its first
     chapter, and is held there (snapping off) until it has finished loading
     or the reader touches it, so iOS can't re-snap it to a later chapter. */
(function () {
  var dock = document.querySelector('.page-dock');
  if (!dock) return;

  var root = document.documentElement;
  var onCase = dock.classList.contains('on-case');
  var phone = window.matchMedia('(max-width: 768px)');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');


  /* ---------- Controlled jump ---------- */

  var watching = false;
  var cleanup = null;

  function release() {
    root.classList.remove('dock-jump');
    watching = false;
    if (cleanup) { cleanup(); cleanup = null; }
  }

  // Wait for the glide to finish (`scrollend`, or the position has stopped
  // changing), then pin the page exactly on the target. Snapping stays off
  // until a touch, wheel, key or mouse press hands control back to the reader.
  function watchUntilStopped(target) {
    var started = Date.now();
    var last = window.scrollY;
    var lastMove = started;
    var moved = false;
    var raf = 0;
    watching = true;

    function tick() {
      if (!watching) return;
      var now = Date.now();
      var y = window.scrollY;
      if (y !== last) { last = y; lastMove = now; moved = true; }
      var still = now - lastMove;
      // stopped after moving, already there (never moved), or safety cap
      if ((moved && still > 140) || (!moved && now - started > 350) || now - started > 2500) {
        settle();
        return;
      }
      raf = requestAnimationFrame(tick);
    }

    function stop() { release(); }
    var events = ['touchstart', 'wheel', 'keydown', 'mousedown'];
    events.forEach(function (n) { window.addEventListener(n, stop, { passive: true, once: true }); });
    window.addEventListener('scrollend', onScrollEnd);
    function onScrollEnd() { if (moved) settle(); }

    var settled = false;
    function settle() {
      if (settled) return;
      settled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('scrollend', onScrollEnd);
      // land exactly on the chapter's snap point, so there is nothing to correct
      target.el.scrollIntoView({ behavior: 'instant', block: target.block });
    }

    cleanup = function () {
      cancelAnimationFrame(raf);
      events.forEach(function (n) { window.removeEventListener(n, stop); });
      window.removeEventListener('scrollend', onScrollEnd);
    };
    raf = requestAnimationFrame(tick);
  }

  function jump(target) {
    if (watching) release();
    root.classList.add('dock-jump');
    target.el.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: target.block });
    watchUntilStopped(target);
  }

  // Which element to scroll, and how to align it, so the page lands exactly
  // where the snapping would put it.
  function resolve(id) {
    if (!id || id === 'top') return { el: document.body, block: 'start' };
    var t = document.getElementById(id);
    if (!t) return null;

    // Home cards: on phones the card's link is the snap target (top edge,
    // 56px clear of the nav); on desktop the card sits in the centre.
    var link = t.closest ? t.closest('.sub-row > a') : null;
    if (link) return { el: phone.matches ? link : t, block: phone.matches ? 'start' : 'center' };

    // Case-study sections: use whatever alignment the CSS snaps them with.
    var align = (getComputedStyle(t).scrollSnapAlign || '').split(' ')[0];
    return { el: t, block: (align === 'center' || align === 'end') ? align : 'start' };
  }

  var links = Array.prototype.slice.call(dock.querySelectorAll('a[href^="#"]'));
  links.forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var href = a.getAttribute('href') || '';
      var target = resolve(decodeURIComponent(href.slice(1)));
      if (!target) return;
      e.preventDefault();
      jump(target);
      // keep the link shareable without adding a history entry per tap
      if (history.replaceState) { try { history.replaceState(null, '', href); } catch (err) {} }
    });
  });

  if (!onCase) return;


  /* ---------- Case study: start at the top ---------- */

  // Pinning once isn't enough on iOS Safari: as images and fonts load, the
  // page grows and Safari re-snaps, which can leave it on a later chapter.
  // So snapping stays off and the page is held at the top until the page has
  // fully loaded and settled, or until the reader touches, scrolls or presses
  // a key (whichever comes first).
  if (!location.hash) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    var holding = true;
    var toTop = function () {
      if (!holding) return;
      root.style.scrollBehavior = 'auto';
      if (window.scrollY !== 0) window.scrollTo(0, 0);
      root.style.scrollBehavior = '';
    };
    var inputs = ['touchstart', 'wheel', 'keydown', 'mousedown'];
    var letGo = function () {
      if (!holding) return;
      holding = false;
      root.classList.remove('dock-jump');
      inputs.forEach(function (n) { window.removeEventListener(n, letGo); });
      window.removeEventListener('scroll', toTop);
    };
    root.classList.add('dock-jump');      // snapping off while holding
    toTop();
    window.addEventListener('scroll', toTop, { passive: true });
    inputs.forEach(function (n) { window.addEventListener(n, letGo, { passive: true }); });
    document.addEventListener('DOMContentLoaded', toTop);
    window.addEventListener('pageshow', toTop);
    window.addEventListener('load', function () {
      toTop();
      // give late layout (fonts, video posters) a moment, then hand over
      setTimeout(function () { toTop(); letGo(); }, 400);
    });
    // safety cap, in case `load` is very slow
    setTimeout(letGo, 6000);
  }


  /* ---------- Case study: highlight the chapter in view ---------- */

  var kids = Array.prototype.slice.call(dock.querySelectorAll('.dock-kid'));
  var pairs = kids.map(function (kid) {
    var id = decodeURIComponent((kid.getAttribute('href') || '').slice(1));
    return { kid: kid, section: id ? document.getElementById(id) : null };
  }).filter(function (p) { return p.section; });
  if (!pairs.length) return;

  var current = null;
  var lockedUntil = 0;   // while a tapped jump is gliding, ignore scroll updates

  function mark(pair) {
    if (pair === current) return;
    if (current) {
      current.kid.classList.remove('is-current');
      current.kid.removeAttribute('aria-current');
    }
    current = pair;
    pair.kid.classList.add('is-current');
    pair.kid.setAttribute('aria-current', 'location');
  }

  // The section whose middle is closest to the middle of the screen
  // (matches the page's centre scroll-snapping).
  function inView() {
    var mid = window.innerHeight / 2;
    var best = pairs[0], bestDist = Infinity;
    pairs.forEach(function (p) {
      var r = p.section.getBoundingClientRect();
      var d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bestDist) { bestDist = d; best = p; }
    });
    // At the very top or bottom of the page, prefer the first / last section
    var doc = document.documentElement;
    if (window.scrollY <= 2) best = pairs[0];
    else if (window.scrollY + window.innerHeight >= doc.scrollHeight - 2) best = pairs[pairs.length - 1];
    return best;
  }

  var ticking = false;
  function onScroll() {
    if (Date.now() < lockedUntil || ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; mark(inView()); });
  }

  pairs.forEach(function (p) {
    p.kid.addEventListener('click', function () {
      mark(p);
      lockedUntil = Date.now() + 2600;   // covers the longest glide
    });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('scrollend', function () { lockedUntil = 0; mark(inView()); });
  window.addEventListener('resize', onScroll);

  // Initial state, including arriving on a #section link
  var fromHash = pairs.filter(function (p) { return '#' + p.section.id === location.hash; })[0];
  mark(fromHash || inView());
})();
