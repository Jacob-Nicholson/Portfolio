/* Home page: the page ends exactly where the last project card settles, so
   once it has snapped into place there is nothing left to scroll.

   The empty <footer> spacer is sized to exactly the room the last snap
   needs, or, when the last card's row already reaches past that point (on
   phones), .main-grid is cut short there and the empty rest is clipped.
   Recalculated whenever the window size changes, including phone toolbars
   showing and hiding. */
(function () {
  var grid = document.querySelector('.main-grid');
  var rows = document.querySelectorAll('.right-col-grid > .sub-row');
  var lastRow = rows[rows.length - 1];
  if (!grid || !lastRow) return;
  var lastLink = lastRow.querySelector(':scope > a');
  var footer = document.querySelector('body > footer');
  var root = document.documentElement;

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

  function fit() {
    grid.style.height = '';
    if (footer) { footer.style.display = ''; footer.style.height = '0px'; }
    var gridTop = grid.getBoundingClientRect().top + window.scrollY;
    var natural = grid.getBoundingClientRect().height;
    var end = settledY() + window.innerHeight;          // page should end here
    var extra = end - (gridTop + natural);
    if (extra >= 0) {
      // the snap needs a little room below the grid: the footer provides it
      if (footer) footer.style.height = extra + 'px';
    } else {
      // too much room below: cut the grid short (the cut-off part is empty)
      if (footer) footer.style.display = 'none';
      grid.style.height = (natural + extra) + 'px';
    }
  }

  grid.style.overflowY = 'clip';      // trims without becoming a scroll box
  fit();
  window.addEventListener('resize', fit);
  window.addEventListener('load', fit);
})();
