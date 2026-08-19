window.AccentEngine = (function () {
  var DEFAULT_ACCENT = '#ffb454';

  function applyColor(hex) {
    if (!hex) hex = DEFAULT_ACCENT;
    document.documentElement.style.setProperty('--accent', hex);
  }

  function applyForMode(settings, bgWidget) {
    var mode = settings.accentMode || 'default';
    if (mode === 'custom') {
      applyColor(settings.accentColor || DEFAULT_ACCENT);
      return;
    }
    if (mode === 'wallpaper') {
      var img = bgWidget.getBgImage();
      if (img && img.style.display === 'block') {
        if (img.complete && img.naturalWidth) {
          applyColor(Helpers.extractAccentFromImage(img) || DEFAULT_ACCENT);
          return;
        } else {
          img.addEventListener('load', function () {
            applyColor(Helpers.extractAccentFromImage(img) || DEFAULT_ACCENT);
          }, { once: true });
          return;
        }
      }
      var vid = bgWidget.getBgVideo();
      if (vid && vid.style.display === 'block') {
        if (vid.readyState >= 2) {
          applyColor(Helpers.extractAccentFromImage(vid) || DEFAULT_ACCENT);
          return;
        } else {
          vid.addEventListener('loadeddata', function () {
            applyColor(Helpers.extractAccentFromImage(vid) || DEFAULT_ACCENT);
          }, { once: true });
          return;
        }
      }
      applyColor(DEFAULT_ACCENT);
      return;
    }
    applyColor(DEFAULT_ACCENT);
  }

  return {
    DEFAULT_ACCENT: DEFAULT_ACCENT,
    applyColor: applyColor,
    applyForMode: applyForMode
  };
})();
