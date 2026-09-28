(function () {
  // Hero video: some mobile browsers ignore the autoplay attribute until nudged.
  var v = document.querySelector('.hero-video');
  if (v) {
    v.muted = true;
    var kick = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    kick();
    v.addEventListener('loadedmetadata', kick);
    v.addEventListener('canplay', kick);
  }

  // Reassemble obfuscated email into a mailto link.
  document.querySelectorAll('.obf-email[data-u]').forEach(function (el) {
    var addr = el.getAttribute('data-u') + '@' + el.getAttribute('data-d');
    var a = document.createElement('a');
    a.href = 'mailto:' + addr;
    a.textContent = addr;
    el.replaceWith(a);
  });

  // Mobile menu (native popover): close after picking a link.
  var menu = document.getElementById('menu');
  if (menu && menu.hidePopover) {
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) menu.hidePopover(); });
  }
})();
