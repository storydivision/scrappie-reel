(function () {
  var current = null;

  // Video.js loads once, on demand (cached on window.__vjsLoadPromise).
  function ensureVjsLoaded() {
    if (window.videojs) return Promise.resolve();
    if (window.__vjsLoadPromise) return window.__vjsLoadPromise;
    window.__vjsLoadPromise = new Promise(function (resolve, reject) {
      var a = window.__vjsAssets;
      if (!a) { reject(new Error('vjs assets missing')); return; }
      var pending = 2, settled = false;
      function done() { if (!settled && --pending === 0) { settled = true; resolve(); } }
      function fail(e) { if (!settled) { settled = true; reject(e); } }
      var link = document.createElement('link');
      link.rel = 'stylesheet'; link.href = a.css; link.onload = done; link.onerror = fail;
      document.head.appendChild(link);
      var s = document.createElement('script');
      s.src = a.js; s.onload = done; s.onerror = fail;
      document.head.appendChild(s);
    });
    return window.__vjsLoadPromise;
  }

  function initVjsPlayer(el) {
    if (el.__vjsPlayer) return el.__vjsPlayer;
    var player = videojs(el, {
      playsinline: true,
      preload: 'metadata',
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      html5: { vhs: { overrideNative: false, enableLowInitialPlaylist: true } }
    });
    player.addClass('vjs-reel');
    el.__vjsPlayer = player;
    return player;
  }

  function setVjsSources(player, el) {
    var hls = el.getAttribute('data-hls');
    var mp4 = el.getAttribute('data-mp4');
    var sources = [];
    if (hls) sources.push({ src: hls, type: 'application/vnd.apple.mpegurl' });
    if (mp4) sources.push({ src: mp4, type: 'video/mp4' });
    player.src(sources);
    if (hls && mp4 && !player.__vjsFallbackWired) {
      player.__vjsFallbackWired = true;
      var tried = false;
      player.on('error', function () {
        if (tried || !player.error()) return;
        tried = true;
        player.reset();
        player.src({ src: mp4, type: 'video/mp4' });
      });
    }
  }

  // Warm path: init + buffer before the tap so play() can run inside the click gesture.
  function setupVjs(el) {
    if (el.__vjsSetupStarted) return;
    el.__vjsSetupStarted = true;
    ensureVjsLoaded().then(function () {
      if (!window.videojs) return;
      setVjsSources(initVjsPlayer(el), el);
    }).catch(function (e) { console.error('vjs load failed', e); });
  }

  function stop(dialog) {
    var iframe = dialog.querySelector('iframe[data-src]');
    if (iframe) iframe.removeAttribute('src');
    var el = dialog.querySelector('video[data-vjs]');
    if (el && el.__vjsPlayer) el.__vjsPlayer.pause();
  }

  function open(id) {
    var dialog = document.getElementById(id);
    if (!dialog || !dialog.showModal) return false;
    if (current && current !== dialog) closeDialog(current);
    if (!dialog.open) dialog.showModal();
    current = dialog;

    var iframe = dialog.querySelector('iframe[data-src]');
    if (iframe) iframe.src = iframe.getAttribute('data-src') + '&autoplay=1';

    var el = dialog.querySelector('video[data-vjs]');
    if (el) {
      if (el.__vjsPlayer) {
        // MUST stay a direct synchronous call in the click handler: iOS rejects unmuted
        // play() not traceable to a user gesture. No .then/await/event wrapping.
        el.__vjsPlayer.play().catch(function () {});
      } else {
        // Cold path: tapped before pre-init finished; may need a second tap on iOS.
        ensureVjsLoaded().then(function () {
          if (current !== dialog) return;
          var p = initVjsPlayer(el);
          setVjsSources(p, el);
          el.__vjsSetupStarted = true;
          p.one('loadedmetadata', function () { p.play().catch(function () {}); });
        }).catch(function (e) { console.error('vjs load failed', e); });
      }
    }
    return true;
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-film]');
    if (trigger) {
      if (open(trigger.getAttribute('data-film'))) e.preventDefault();
      return;
    }
    var closer = e.target.closest('[data-close]');
    if (closer) { closeDialog(closer.closest('dialog')); return; }
    // Click on the dialog's own backdrop area (outside .player-inner) closes it.
    if (e.target.matches && e.target.matches('dialog.player')) closeDialog(e.target);
  });

  // Stop playback synchronously: the async 'close' event can be deferred (e.g. background tabs).
  function closeDialog(d) {
    stop(d);
    if (current === d) current = null;
    d.close();
  }

  // Explicit Escape: native close requests can be throttled/ignored without fresh user activation.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && current) { e.preventDefault(); closeDialog(current); }
  });

  document.querySelectorAll('dialog.player').forEach(function (d) {
    d.addEventListener('cancel', function () { stop(d); if (current === d) current = null; }); // Escape
    d.addEventListener('close', function () { if (!d.open) stop(d); if (current === d && !d.open) current = null; });
  });

  var tiles = document.querySelectorAll('.tile[data-film]');

  // Hover trailers (pointer devices only).
  if (window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) {
    tiles.forEach(function (tile) {
      var v = tile.querySelector('video[data-trailer]');
      if (!v) return;
      v.addEventListener('playing', function () { tile.classList.add('is-playing'); });
      tile.addEventListener('mouseenter', function () { v.play().catch(function () {}); });
      tile.addEventListener('mouseleave', function () { tile.classList.remove('is-playing'); v.pause(); });
    });
  }

  // Pre-init players for tiles near the viewport.
  function warm(tile) {
    var d = document.getElementById(tile.getAttribute('data-film'));
    var el = d && d.querySelector('video[data-vjs]');
    if (el) setupVjs(el);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        warm(entry.target);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '300px 0px' });
    tiles.forEach(function (t) { io.observe(t); });
  } else {
    tiles.forEach(warm);
  }
  // Hero reel button points at a film too.
  document.querySelectorAll('.reel-btn[data-film]').forEach(warm);

  // Deep link: /#film-<slug> opens that film (no autoplay: no gesture).
  if (location.hash.indexOf('#film-') === 0) open(location.hash.slice(1));
})();
