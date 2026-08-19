window.ShortcutsManager = (function () {
  var shortcutsEl = null;
  var shortcuts = [];
  var onEdit = null;

  function init(config) {
    shortcutsEl = config.shortcutsEl;
    onEdit = config.onEdit || function () {};
  }

  async function load() {
    shortcuts = await Storage.loadShortcuts();
    render();
  }

  async function save() {
    await Storage.saveShortcuts(shortcuts);
  }

  function render() {
    shortcutsEl.textContent = '';

    shortcuts.forEach(function (sc) {
      var hostname = Helpers.getHostname(sc.url);
      var tile = document.createElement('div');
      tile.className = 'tile';
      tile.dataset.id = sc.id;

      var iconBox = document.createElement('div');
      iconBox.className = 'icon-box';
      var img = document.createElement('img');
      img.src = sc.icon || Helpers.faviconUrl(hostname);
      img.alt = '';
      img.draggable = false;
      img.onerror = function () {
        iconBox.textContent = '';
        var letter = document.createElement('div');
        letter.className = 'fallback-letter';
        letter.textContent = (sc.name || hostname).charAt(0).toUpperCase();
        iconBox.appendChild(letter);
      };
      iconBox.appendChild(img);

      var label = document.createElement('div');
      label.className = 'label';
      label.textContent = sc.name || hostname;

      var removeBtn = document.createElement('div');
      removeBtn.className = 'remove-btn';
      removeBtn.textContent = '\u2715';
      removeBtn.title = 'Remove';
      removeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        shortcuts = shortcuts.filter(function (s) { return s.id !== sc.id; });
        save();
        render();
      });

      var editBtn = document.createElement('div');
      editBtn.className = 'edit-btn';
      editBtn.textContent = '\u270E';
      editBtn.title = 'Edit';
      editBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        onEdit(sc);
      });

      tile.appendChild(removeBtn);
      tile.appendChild(editBtn);
      tile.appendChild(iconBox);
      tile.appendChild(label);

      tile.addEventListener('click', function () {
        if (tile.dataset.justDragged === '1') return;
        window.location.href = sc.url;
      });

      attachTileReorder(tile, sc);
      shortcutsEl.appendChild(tile);
    });

    var addTile = document.createElement('div');
    addTile.className = 'tile add-tile';
    var addIconBox = document.createElement('div');
    addIconBox.className = 'icon-box';
    addIconBox.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
    var addLabel = document.createElement('div');
    addLabel.className = 'label';
    addLabel.textContent = 'Add';
    addTile.appendChild(addIconBox);
    addTile.appendChild(addLabel);
    addTile.addEventListener('click', function () { onEdit(null); });
    shortcutsEl.appendChild(addTile);
  }

  function attachTileReorder(tile, sc) {
    var pointerId = null;
    var dragging = false;
    var startX = 0, startY = 0;
    var DRAG_THRESHOLD = 6;

    tile.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.remove-btn') || e.target.closest('.edit-btn')) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      dragging = false;
      tile.setPointerCapture(pointerId);
    });

    tile.addEventListener('pointermove', function (e) {
      if (pointerId === null || e.pointerId !== pointerId) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;

      if (!dragging) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
        dragging = true;
        tile.classList.add('dragging');
        tile.style.position = 'relative';
        tile.style.pointerEvents = 'none';
      }

      tile.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';

      var under = document.elementFromPoint(e.clientX, e.clientY);
      var overTile = under ? under.closest('.tile') : null;
      if (overTile && overTile !== tile && !overTile.classList.contains('add-tile') && overTile.parentElement === shortcutsEl) {
        var overRect = overTile.getBoundingClientRect();
        var insertBefore = e.clientX < overRect.left + overRect.width / 2;
        shortcutsEl.insertBefore(tile, insertBefore ? overTile : overTile.nextSibling);
      }
    });

    function endDrag(e) {
      if (pointerId === null || e.pointerId !== pointerId) return;
      try { tile.releasePointerCapture(pointerId); } catch (err) {}
      pointerId = null;
      tile.style.pointerEvents = '';
      tile.style.transform = '';
      tile.style.position = '';
      tile.classList.remove('dragging');

      if (dragging) {
        dragging = false;
        var ids = Array.from(shortcutsEl.querySelectorAll('.tile:not(.add-tile)')).map(function (t) { return t.dataset.id; });
        shortcuts.sort(function (a, b) { return ids.indexOf(a.id) - ids.indexOf(b.id); });
        save();
        tile.dataset.justDragged = '1';
        setTimeout(function () { tile.dataset.justDragged = ''; }, 0);
      }
    }
    tile.addEventListener('pointerup', endDrag);
    tile.addEventListener('pointercancel', endDrag);
  }

  function addShortcut(url, name, icon) {
    var normalizedUrl = Helpers.normalizeUrl(url);
    var hostname = Helpers.getHostname(normalizedUrl);
    var shortcutName = name || hostname;
    shortcuts.push({
      id: Helpers.generateId(),
      url: normalizedUrl,
      name: shortcutName,
      icon: icon || undefined
    });
    save();
    render();
  }

  function updateShortcut(id, url, name, icon) {
    var idx = shortcuts.findIndex(function (s) { return s.id === id; });
    if (idx !== -1) {
      var normalizedUrl = Helpers.normalizeUrl(url);
      var hostname = Helpers.getHostname(normalizedUrl);
      shortcuts[idx] = {
        id: id,
        url: normalizedUrl,
        name: name || hostname,
        icon: icon || undefined
      };
      save();
      render();
    }
  }

  return {
    init: init,
    load: load,
    render: render,
    addShortcut: addShortcut,
    updateShortcut: updateShortcut
  };
})();
