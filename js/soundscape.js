/* Past / Present / Future soundscape card (case study three).
   Press a button to play its soundscape and start its animation:
     PAST    - warm sepia sky with drifting white blocks
     PRESENT - blue sky with drifting clouds
     FUTURE  - white sky with drifting words
   Press the same button again to stop; pressing another switches.
   Only one track plays at a time. Everything resets when a track ends
   or the card scrolls out of view. The speaker icon mutes / unmutes. */
(function () {
  var card = document.querySelector('.sound-card');
  if (!card) return;

  var buttons = Array.prototype.slice.call(card.querySelectorAll('.sound-btn'));
  var audios = {};
  Array.prototype.forEach.call(card.querySelectorAll('audio[data-sound]'), function (a) {
    audios[a.dataset.sound] = a;
    a.addEventListener('ended', stopAll);
  });
  var mute = card.querySelector('.sound-mute');
  var muted = false;

  /* ---------------- animation ---------------- */
  var canvas = card.querySelector('.sound-sky');
  var ctx = canvas.getContext('2d');
  // The drift only runs after a visitor presses a button, so it plays even when
  // the system's "Reduce motion" setting is on (as in the original piece).
  var W = 0, H = 0, S = 1;          // card size and scale (1 = the original 1440px-wide page)
  var mode = 'none', elements = [], lastSpawn = -Infinity, lastT = 0, raf = 0;
  var SPAWN_MS = 2000;
  var WORDS = ['promising', 'technology', 'recession', 'hope', 'cats', 'environment', 'war', 'community'];
  var font = getComputedStyle(card).fontFamily;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    var r = card.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height; S = W / 1440;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Like the original: each shape pops in at the left edge (x = -50) and drifts right
  function spawn() {
    var y = rand(Math.max(12, 50 * S), H / 2);
    if (mode === 'past') {
      elements.push({ kind: 'rect', x: -50 * S, y: y, w: rand(50, 150) * S, h: rand(20, 60) * S, v: 60 });
    } else if (mode === 'present') {
      elements.push({ kind: 'cloud', x: -50 * S, y: y, size: rand(0.8, 1.3) * S, v: 30 });
    } else if (mode === 'future') {
      elements.push({ kind: 'word', x: -50 * S, y: y, word: WORDS[Math.floor(Math.random() * WORDS.length)], v: 60 });
    }
  }

  function halfEllipse(cx, cy, w, h) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, w / 2, h / 2, 0, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }

  function draw(el) {
    if (el.kind === 'rect') {
      ctx.fillStyle = '#fff';
      ctx.fillRect(el.x, el.y, el.w, el.h);
    } else if (el.kind === 'cloud') {
      var s = el.size;
      ctx.fillStyle = '#fff';
      halfEllipse(el.x, el.y, 25 * s, 20 * s);
      halfEllipse(el.x + 10 * s, el.y, 25 * s, 45 * s);
      halfEllipse(el.x + 25 * s, el.y, 25 * s, 35 * s);
      halfEllipse(el.x + 40 * s, el.y, 30 * s, 20 * s);
    } else {
      ctx.fillStyle = '#000';
      ctx.font = 24 * S + 'px ' + font;
      ctx.textBaseline = 'middle';
      ctx.fillText(el.word, el.x, el.y);
    }
  }

  function frame(t) {
    var dt = Math.min((t - (lastT || t)) / 1000, 0.1);
    lastT = t;
    ctx.clearRect(0, 0, W, H);
    if (mode !== 'none' && t - lastSpawn > SPAWN_MS) { spawn(); lastSpawn = t; }
    for (var i = elements.length - 1; i >= 0; i--) {
      var el = elements[i];
      el.x += el.v * S * dt;
      if (el.kind === 'cloud') el.y += rand(-0.5, 0.5) * S;
      draw(el);
      if (el.x > W + 50 * S) elements.splice(i, 1);
    }
    raf = (mode !== 'none' || elements.length) ? requestAnimationFrame(frame) : 0;
  }

  function setMode(next) {
    mode = next;
    elements = [];
    lastSpawn = -Infinity;
    if (next === 'none') { card.removeAttribute('data-mode'); }
    else { card.setAttribute('data-mode', next); }
    ctx.clearRect(0, 0, W, H);
    if (next !== 'none' && !raf) { lastT = 0; raf = requestAnimationFrame(frame); }
  }

  /* ---------------- audio ---------------- */
  function stopAll() {
    Object.keys(audios).forEach(function (k) {
      audios[k].pause();
      try { audios[k].currentTime = 0; } catch (e) {}
    });
    buttons.forEach(function (b) {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    setMode('none');
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var wasActive = btn.classList.contains('active');
      stopAll();
      if (wasActive) return;
      var name = btn.dataset.sound;
      var audio = audios[name];
      if (!audio) return;
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      setMode(name);
      audio.muted = muted;
      var p = audio.play();
      if (p && p.catch) p.catch(function () { stopAll(); });
    });
  });

  mute.addEventListener('click', function () {
    muted = !muted;
    Object.keys(audios).forEach(function (k) { audios[k].muted = muted; });
    mute.classList.toggle('is-muted', muted);
    mute.setAttribute('aria-pressed', String(muted));
    mute.setAttribute('aria-label', muted ? 'Unmute soundscape' : 'Mute soundscape');
    mute.title = muted ? 'Unmute' : 'Mute';
  });

  resize();
  window.addEventListener('resize', resize);
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(card);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (!e.isIntersecting) stopAll(); });
    }, { threshold: 0.2 }).observe(card);
  }
})();
