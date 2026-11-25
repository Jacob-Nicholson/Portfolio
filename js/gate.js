/* Simple password gate for case studies one and two.
   A courtesy lock, not real security: it hides the page until the
   password is entered and remembers it in this browser. */
(function () {
  var KEY = 'jn-case-access';
  var HASH = 'dc3ae2ca';            // FNV-1a hash of the password

  function hash(str) {
    var h = 0x811c9dc5, bytes = unescape(encodeURIComponent(str));
    for (var i = 0; i < bytes.length; i++) {
      h ^= bytes.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return ('0000000' + h.toString(16)).slice(-8);
  }

  try { if (localStorage.getItem(KEY) === HASH) return; } catch (e) {}
  document.documentElement.classList.add('pw-locked');

  function build() {
    var gate = document.createElement('div');
    gate.className = 'pw-gate';
    gate.innerHTML =
      '<a class="back-home" href="/index.html" aria-label="Back to home" title="Back to home">' +
        '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M.7 .7l8.6 8.6M9.3 .7L.7 9.3"/></svg></a>' +
      '<form class="pw-form" novalidate>' +
        '<label for="pw-input">Password protected</label>' +
        '<span class="pw-field">' +
          '<input id="pw-input" type="password" autocomplete="current-password" placeholder="Password">' +
          '<button type="submit" aria-label="Unlock"><svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 5h8M5.5 1.5L9 5 5.5 8.5"/></svg></button>' +
        '</span>' +
      '</form>';
    document.body.appendChild(gate);

    var form = gate.querySelector('form');
    var input = gate.querySelector('input');
    input.focus();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (hash(input.value.trim().toLowerCase()) === HASH) {
        try { localStorage.setItem(KEY, HASH); } catch (err) {}
        document.documentElement.classList.remove('pw-locked');
        gate.remove();
        window.scrollTo(0, 0);
      } else {
        form.classList.remove('is-wrong');
        void form.offsetWidth;
        form.classList.add('is-wrong');
        input.select();
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
