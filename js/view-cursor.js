/* Home page "View" pill.
   - Mouse or trackpad (at any window width): it follows the cursor while it
     is over a project card.
   - Touch, phone layout: it sits beside the card, centred in the space to the
     card's left and on the card's height (data-pill="side").
   - Touch, wide layout (or a phone too narrow for the side spot): 12px under
     the card, centred on the part of the card that is on screen. */
(function () {
  var mq = window.matchMedia('(hover: hover) and (pointer: fine)');
  var links = Array.prototype.slice.call(document.querySelectorAll('.sub-row > a'));
  if (!links.length) return;

  var GAP_X = 20;     // pill's left edge from the pointer
  var HALF_H = 14.5;  // half the pill's 29px height, so it is centred on the pointer
  var EDGE = 8;       // keep this much clear of the window's right edge

  function move(pill, e) {
    var w = pill.offsetWidth || 120;
    var x = e.clientX + GAP_X;
    // near the right edge, flip to the pointer's left instead of clipping
    if (x + w > window.innerWidth - EDGE) x = e.clientX - GAP_X - w;
    pill.style.setProperty('--view-x', Math.round(x) + 'px');
    pill.style.setProperty('--view-y', Math.round(e.clientY - HALF_H) + 'px');
  }

  links.forEach(function (link) {
    var pill = link.querySelector('.view-pill');
    if (!pill) return;

    link.addEventListener('pointerenter', function (e) {
      if (!mq.matches || e.pointerType !== 'mouse') return;
      move(pill, e);                 // place it first so it never flashes at 0,0
      pill.classList.add('is-visible');
    });

    link.addEventListener('pointermove', function (e) {
      if (!mq.matches || e.pointerType !== 'mouse') return;
      move(pill, e);
    });

    link.addEventListener('pointerleave', function () {
      pill.classList.remove('is-visible');
    });
  });

  var phone = window.matchMedia('(max-width: 768px)');
  var SIDE_ROOM = 16;   // the side spot needs the pill's width plus this much

  // Touch: place each pill beside its card (phones) or under it.
  function centreOnVisible() {
    var viewW = document.documentElement.clientWidth;
    links.forEach(function (link) {
      var card = link.querySelector('.case-study') || link;
      var pill = link.querySelector('.view-pill');
      if (!pill) return;
      if (mq.matches) {
        link.style.removeProperty('--pill-shift');
        link.removeAttribute('data-pill');
        return;
      }
      var c = card.getBoundingClientRect();
      var a = link.getBoundingClientRect();
      var aCentre = (a.left + a.right) / 2;
      if (phone.matches && c.left >= pill.offsetWidth + SIDE_ROOM) {
        link.setAttribute('data-pill', 'side');
        link.style.setProperty('--pill-shift', Math.round(c.left / 2 - aCentre) + 'px');
        return;
      }
      link.removeAttribute('data-pill');
      var left = Math.max(c.left, 0);
      var right = Math.min(c.right, viewW);
      if (right <= left) return;
      var shift = (left + right) / 2 - (a.left + a.right) / 2;
      // keep the whole pill on screen
      var half = pill.offsetWidth / 2, centre = (a.left + a.right) / 2 + shift;
      if (centre - half < 8) shift += 8 - (centre - half);
      if (centre + half > viewW - 8) shift -= centre + half - (viewW - 8);
      link.style.setProperty('--pill-shift', Math.round(shift) + 'px');
    });
  }
  centreOnVisible();
  window.addEventListener('resize', centreOnVisible);
  window.addEventListener('load', centreOnVisible);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(centreOnVisible);
  if (mq.addEventListener) mq.addEventListener('change', centreOnVisible);
  if (phone.addEventListener) phone.addEventListener('change', centreOnVisible);
})();
