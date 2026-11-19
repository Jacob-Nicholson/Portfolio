/* Case-study dock: one chapter dot per image + paragraph section.
   The dot for the section in view turns dark grey, whether the reader
   scrolls there or clicks the dot. Does nothing on the home page. */
(function () {
  var dock = document.querySelector('.page-dock.on-case');
  if (!dock) return;

  var kids = Array.prototype.slice.call(dock.querySelectorAll('.dock-kid'));
  var pairs = kids.map(function (kid) {
    var id = decodeURIComponent((kid.getAttribute('href') || '').slice(1));
    return { kid: kid, section: id ? document.getElementById(id) : null };
  }).filter(function (p) { return p.section; });
  if (!pairs.length) return;

  var current = null;
  var lockedUntil = 0;   // while a clicked jump is scrolling, ignore scroll updates

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
      lockedUntil = Date.now() + 1200;
    });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('scrollend', function () { lockedUntil = 0; mark(inView()); });
  window.addEventListener('resize', onScroll);

  // Initial state, including arriving on a #section link
  var fromHash = pairs.filter(function (p) { return '#' + p.section.id === location.hash; })[0];
  mark(fromHash || inView());
})();
