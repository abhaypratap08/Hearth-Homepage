window.ShortcutModal = (function () {
  var overlayEl = null;
  var titleEl = null;
  var urlInput = null;
  var nameInput = null;
  var iconPreview = null;
  var iconFileInput = null;
  var uploadBtn = null;
  var useDefaultBtn = null;
  var saveBtn = null;
  var hintEl = null;
  var onSave = null;

  var editingId = null;
  var customIconData = null;

  function init(config) {
    overlayEl = config.overlayEl;
    titleEl = config.titleEl;
    urlInput = config.urlInput;
    nameInput = config.nameInput;
    iconPreview = config.iconPreview;
    iconFileInput = config.iconFileInput;
    uploadBtn = config.uploadBtn;
    useDefaultBtn = config.useDefaultBtn;
    saveBtn = config.saveBtn;
    hintEl = config.hintEl;
    onSave = config.onSave || function () {};

    document.getElementById('cancel-btn').addEventListener('click', close);
    overlayEl.addEventListener('click', function (e) {
      if (e.target === overlayEl) close();
    });

    uploadBtn.addEventListener('click', function () { iconFileInput.click(); });
    useDefaultBtn.addEventListener('click', function () {
      customIconData = null;
      renderIconPreview(null);
    });

    iconFileInput.addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        Helpers.showHint(hintEl, 'Please choose an image file');
        return;
      }
      var reader = new FileReader();
      reader.onload = function (ev) {
        customIconData = ev.target.result;
        renderIconPreview(customIconData);
      };
      reader.onerror = function () { Helpers.showHint(hintEl, 'Could not read image'); };
      reader.readAsDataURL(file);
      e.target.value = '';
    });

    saveBtn.addEventListener('click', submit);
    urlInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
    nameInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
  }

  function open(existing) {
    if (existing) {
      editingId = existing.id;
      urlInput.value = existing.url;
      nameInput.value = existing.name || '';
      customIconData = existing.icon || null;
      titleEl.textContent = 'Edit shortcut';
      saveBtn.textContent = 'Save';
    } else {
      editingId = null;
      urlInput.value = '';
      nameInput.value = '';
      customIconData = null;
      titleEl.textContent = 'Add shortcut';
      saveBtn.textContent = 'Add';
    }
    renderIconPreview(customIconData);
    overlayEl.classList.add('open');
    setTimeout(function () { urlInput.focus(); }, 50);
  }

  function close() {
    overlayEl.classList.remove('open');
  }

  function renderIconPreview(src) {
    iconPreview.textContent = '';
    if (src) {
      var img = document.createElement('img');
      img.src = src;
      iconPreview.appendChild(img);
      useDefaultBtn.style.display = 'block';
    } else {
      iconPreview.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
      useDefaultBtn.style.display = 'none';
    }
  }

  function submit() {
    var raw = urlInput.value.trim();
    if (!raw) {
      Helpers.showHint(hintEl, 'Enter a website URL');
      return;
    }
    var url = Helpers.normalizeUrl(raw);
    var name = nameInput.value.trim() || Helpers.getHostname(url);

    onSave({
      id: editingId,
      url: url,
      name: name,
      icon: customIconData || undefined
    });
    close();
  }

  return {
    init: init,
    open: open,
    close: close
  };
})();
