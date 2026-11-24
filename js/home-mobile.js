/* Home page on phones: place the "How Might We…" headline + year/description
   as one group, centred in the space between the bottom of the project card
   (which snaps 56px from the top) and the dot navigation at the bottom.
   Uses the screen's real current height, so it holds with mobile toolbars. */
(function () {
  var mq = window.matchMedia('(max-width: 768px)');
  var touch = window.matchMedia('(hover: none), (pointer: coarse)');
  var wrap = document.querySelector('.text-wrap-lock');
  var hmw = document.querySelector('.HMW');
  var heading = document.querySelector('.HMW .pontano-sans-custom');
  var meta = document.querySelector('.case-meta');
  var desc = document.querySelector('.case-description');
  var card = document.querySelector('.case-study');
  var dock = document.querySelector('.page-dock');
  if (!wrap || !hmw || !card || !dock) return;

  var SNAP_TOP = 56;     // matches the cards' scroll-margin-top in style.css
  var PILL_CLEAR = 12 + 29 + 16;   // pill gap + pill height + air before the text
  var SIDE_CLEAR = 16;             // pill beside the card: just air below the card

  function lineHeight(el) {
    var cs = getComputedStyle(el);
    var lh = parseFloat(cs.lineHeight);
    return isNaN(lh) ? parseFloat(cs.fontSize) * 1.2 : lh;
  }

  function place() {
    if (!mq.matches) { wrap.style.transform = ''; return; }
    wrap.style.transform = 'none';
    var cardBottom = SNAP_TOP + card.offsetHeight;
    var dockTop = dock.getBoundingClientRect().top;
    var nowTop = hmw.getClientRects()[0].top;
    // Always size for a typical group (two headline lines, gap, two
    // description lines) so "How Might We" sits in one fixed spot, on load
    // and for every project.
    var group = 2 * lineHeight(heading) + parseFloat(getComputedStyle(meta).marginTop) + 2 * lineHeight(desc);
    var wantTop = (cardBottom + dockTop) / 2 - group / 2;
    // Never let the text block rise into the "View" pill when it hangs 12px
    // under the card (29px tall), whatever the screen height or width.
    // (Only touch screens show that pill; with a mouse it follows the cursor.)
    if (touch.matches) {
      var side = document.querySelector('.sub-row > a[data-pill="side"]');
      wantTop = Math.max(wantTop, cardBottom + (side ? SIDE_CLEAR : PILL_CLEAR));
    }
    wrap.style.transform = 'translateY(' + Math.round(wantTop - nowTop) + 'px)';
  }

  var t;
  function soon() { clearTimeout(t); t = setTimeout(place, 60); }
  window.addEventListener('resize', soon);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', soon);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  window.addEventListener('load', place);

  place();
})();
