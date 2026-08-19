window.BackgroundWidget = (function () {
  var bgImage = null;
  var bgVideo = null;
  var hintEl = null;
  var onAccentChange = null;

  function init(config) {
    bgImage = config.bgImage;
    bgVideo = config.bgVideo;
    hintEl = config.hintEl;
    onAccentChange = config.onAccentChange || function () {};
  }

  function apply(type, src, persist) {
    if (type === 'image') {
      bgVideo.pause();
      bgVideo.style.display = 'none';
      bgVideo.removeAttribute('src');
      bgImage.src = src;
      bgImage.style.display = 'block';
    } else if (type === 'video') {
      bgImage.style.display = 'none';
      bgImage.removeAttribute('src');
      bgVideo.src = src;
      bgVideo.style.display = 'block';
      bgVideo.play().catch(function () {});
    }
    if (persist) {
      Storage.saveBackground(type, src).catch(function () {
        Helpers.showHint(hintEl, 'Background too large to save \u2014 it will reset next time');
      });
    }
    onAccentChange();
  }

  function clear() {
    bgImage.style.display = 'none';
    bgImage.removeAttribute('src');
    bgVideo.pause();
    bgVideo.style.display = 'none';
    bgVideo.removeAttribute('src');
    Storage.clearBackground();
    Helpers.showHint(hintEl, 'Background removed');
    onAccentChange();
  }

  async function load() {
    var data = await Storage.loadBackground();
    if (data) {
      apply(data.type, data.src, false);
    }
  }

  function getBgImage() {
    return bgImage;
  }

  function getBgVideo() {
    return bgVideo;
  }

  return {
    init: init,
    apply: apply,
    clear: clear,
    load: load,
    getBgImage: getBgImage,
    getBgVideo: getBgVideo
  };
})();
