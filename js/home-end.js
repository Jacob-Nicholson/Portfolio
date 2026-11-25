/* Home page ending. After the last project card comes one more full-height
   screen holding the "Other Stuff I've Made" button (.home-more), which
   links to the undergrad archive.

   1. The space under the last card is sized so that screen starts exactly
      at the bottom of the window while the last card is snapped in place:
      .main-grid is cut short where its last row reaches further (phones), or
      given a bottom margin where the snap needs room. Recalculated whenever
      the window size changes, including phone toolbars showing and hiding.
   2. Scrolling on to it moves the page up a full screen; the fixed "How
      Might We" text (.left-col) and the dot navigation (.page-dock) are
      lifted by the same amount, so they leave with the last card and the
      button has the screen to itself, like scrolling between projects. */
(function () {
  var grid = document.querySelector('.main-grid');
  var rows = document.querySelectorAll('.right-col-grid > .sub-row');
  var lastRow = rows[rows.length - 1];
  if (!grid || !lastRow) return;
  var lastLink = lastRow.querySelector(':scope > a');
  var footer = document.querySelector('body > footer');
  var more = document.querySelector('.home-more');
  var leftCol = document.querySelector('.left-col');
  var root = document.documentElement;
  var settled = 0;

  // Where the page sits once the last card has snapped (in page coordinates).
  function settledY() {
    var rs = getComputedStyle(root);
    var padTop = parseFloat(rs.scrollPaddingTop) || 0;
    var padBottom = parseFloat(rs.scrollPaddingBottom) || 0;
    var vh = window.innerHeight;

    // the snapping element: the card's link on phones, the row elsewhere
    var el = lastRow;
    if (lastLink && !/^none/.test(getComputedStyle(lastLink).scrollSnapAlign)) el = lastLink;
    var cs = getComputedStyle(el);
    var align = (cs.scrollSnapAlign || 'center').split(' ').pop();
    var r = el.getBoundingClientRect();
    var top = r.top + window.scrollY - (parseFloat(cs.scrollMarginTop) || 0);
    var bottom = r.bottom + window.scrollY + (parseFloat(cs.scrollMarginBottom) || 0);
    if (align === 'start') return top - padTop;
    if (align === 'end') return bottom - vh + padBottom;
    return (top + bottom) / 2 - (padTop + (vh - padTop - padBottom) / 2);
  }

  var dock = document.querySelector('.page-dock');

  function lift() {
    var by = (more ? Math.max(0, window.scrollY - settled) : 0) + 'px';
    if (leftCol) leftCol.style.setProperty('--end-lift', by);
    if (dock) dock.style.setProperty('--end-lift', by);
  }

  function fit() {
    grid.style.height = '';
    grid.style.marginBottom = '';
    if (footer) { footer.style.display = ''; footer.style.height = '0px'; }
    settled = settledY();
    var gridTop = grid.getBoundingClientRect().top + window.scrollY;
    var natural = grid.getBoundingClientRect().height;
    var end = settled + window.innerHeight;             // last card's screen ends here
    if (more) {
      // the button's screen follows straight on from the last card's: add room
      // as a margin (a taller grid would stretch its rows and move the cards)
      // or cut the grid short (the cut-off part is empty)
      if (footer) footer.style.display = 'none';
      if (end >= gridTop + natural) grid.style.marginBottom = (end - gridTop - natural) + 'px';
      else grid.style.height = (end - gridTop) + 'px';
    } else if (end >= gridTop + natural) {
      // the snap needs a little room below the grid: the footer provides it
      if (footer) footer.style.height = (end - gridTop - natural) + 'px';
    } else {
      // too much room below: cut the grid short (the cut-off part is empty)
      if (footer) footer.style.display = 'none';
      grid.style.height = (end - gridTop) + 'px';
    }
    lift();
  }

  grid.style.overflowY = 'clip';      // trims without becoming a scroll box
  fit();
  window.addEventListener('resize', fit);
  window.addEventListener('load', fit);
  window.addEventListener('scroll', lift, { passive: true });
})();
