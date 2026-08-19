window.WidgetDrag = (function () {
  var widgetData = {};
  var arrangeMode = false;
  var movableWidgets = [];
  var hintEl = null;
  var sizeTooltip = null;
  var MIN_SIZES = {
    'github-widget':    { w: 200, h: 190 },
    'leetcode-widget':  { w: 200, h: 250 },
    'pomodoro-widget':  { w: 160, h: 165 },
    'clock-wrap':       { w: 480, h: 170 },
    'search-form':      { w: 280, h: 50 },
    'shortcuts-wrap':   { w: 280, h: 80 }
  };
  var MAX_SIZES = {
    'github-widget':    { w: 480, h: 600 },
    'leetcode-widget':  { w: 480, h: 600 },
    'pomodoro-widget':  { w: 320, h: 300 },
    'clock-wrap':       { w: 800, h: 300 },
    'search-form':      { w: 900, h: 120 },
    'shortcuts-wrap':   { w: 900, h: 600 }
  };

  function init(config) {
    hintEl = config.hintEl;
    movableWidgets = config.widgets || [];

    movableWidgets.forEach(function (el) {
      makeWidgetDraggable(el);
      makeWidgetResizable(el);
    });

    window.addEventListener('resize', function () {
      movableWidgets.forEach(function (el) {
        if (el.classList.contains('detached')) applyStoredPosition(el);
      });
      movableWidgets.forEach(function (el) {
        if (el.classList.contains('detached')) applyStoredSize(el);
      });
      movableWidgets.forEach(function (el) {
        clampWidgetToViewport(el, false);
      });
    });
  }

  async function loadPositions() {
    widgetData = await Storage.loadWidgetPositions();
    movableWidgets.forEach(function (el) {
      applyStoredPosition(el);
      applyStoredSize(el);
    });
  }

  function savePosition(id, leftPx, topPx) {
    if (!widgetData[id]) widgetData[id] = {};
    widgetData[id].leftFrac = parseFloat(leftPx) / window.innerWidth;
    widgetData[id].topFrac = parseFloat(topPx) / window.innerHeight;
    Storage.saveWidgetPositions(widgetData).catch(function () {
      Helpers.showHint(hintEl, 'Could not save widget position');
    });
  }

  function saveSize(id, widthPx, heightPx) {
    if (!widgetData[id]) widgetData[id] = {};
    widgetData[id].widthFrac = parseFloat(widthPx) / window.innerWidth;
    widgetData[id].heightFrac = parseFloat(heightPx) / window.innerHeight;
    Storage.saveWidgetPositions(widgetData).catch(function () {
      Helpers.showHint(hintEl, 'Could not save widget size');
    });
  }

  function applyStoredPosition(el) {
    var data = widgetData[el.id];
    if (!data || data.leftFrac === undefined) return;
    el.classList.add('detached');
    el.style.left = (data.leftFrac * window.innerWidth) + 'px';
    el.style.top = (data.topFrac * window.innerHeight) + 'px';
    el.style.right = 'auto';
    el.style.bottom = 'auto';
  }

  function applyStoredSize(el) {
    var data = widgetData[el.id];
    if (!data || (data.widthFrac === undefined && data.heightFrac === undefined)) {
      el.style.width = '';
      el.style.height = '';
      return;
    }
    if (data.widthFrac !== undefined) {
      el.style.width = (data.widthFrac * window.innerWidth) + 'px';
    }
    if (data.heightFrac !== undefined) {
      el.style.height = (data.heightFrac * window.innerHeight) + 'px';
    }
  }

  function clampWidgetToViewport(el, persist) {
    if (!el.classList.contains('detached')) return;
    if (el.offsetParent === null && getComputedStyle(el).display === 'none') return;
    var rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    var maxLeft = Math.max(4, window.innerWidth - rect.width - 4);
    var maxTop = Math.max(4, window.innerHeight - rect.height - 4);
    var left = Helpers.clamp(rect.left, 4, maxLeft);
    var top = Helpers.clamp(rect.top, 4, maxTop);
    var changed = false;
    if (left !== rect.left || top !== rect.top) {
      el.style.left = left + 'px';
      el.style.top = top + 'px';
      el.style.right = 'auto';
      el.style.bottom = 'auto';
      changed = true;
    }
    if (persist && changed) {
      savePosition(el.id, el.style.left, el.style.top);
    }
  }

  function ensureDetached(el) {
    if (el.classList.contains('detached')) return;
    var rect = el.getBoundingClientRect();
    el.classList.add('detached');
    el.style.left = rect.left + 'px';
    el.style.top = rect.top + 'px';
    el.style.right = 'auto';
    el.style.bottom = 'auto';
  }

  /* ==================== DRAG ==================== */

  function makeWidgetDraggable(widgetEl) {
    var overlay = widgetEl.querySelector('.widget-drag-overlay');
    if (!overlay) return;
    overlay.addEventListener('pointerdown', function (e) {
      if (!arrangeMode) return;
      if (e.target.closest('.widget-resize-handle')) return;
      e.preventDefault();
      ensureDetached(widgetEl);
      var rect = widgetEl.getBoundingClientRect();
      var startX = e.clientX, startY = e.clientY;
      var origLeft = rect.left, origTop = rect.top;
      overlay.setPointerCapture(e.pointerId);
      overlay.classList.add('grabbing');
      function onMove(ev) {
        var dx = ev.clientX - startX;
        var dy = ev.clientY - startY;
        var maxLeft = Math.max(4, window.innerWidth - widgetEl.offsetWidth - 4);
        var maxTop = Math.max(4, window.innerHeight - widgetEl.offsetHeight - 4);
        widgetEl.style.left = Helpers.clamp(origLeft + dx, 4, maxLeft) + 'px';
        widgetEl.style.top = Helpers.clamp(origTop + dy, 4, maxTop) + 'px';
      }
      function onUp() {
        overlay.releasePointerCapture(e.pointerId);
        overlay.removeEventListener('pointermove', onMove);
        overlay.removeEventListener('pointerup', onUp);
        overlay.classList.remove('grabbing');
        savePosition(widgetEl.id, widgetEl.style.left, widgetEl.style.top);
      }
      overlay.addEventListener('pointermove', onMove);
      overlay.addEventListener('pointerup', onUp);
    });
  }

  /* ==================== RESIZE ==================== */

  function makeWidgetResizable(widgetEl) {
    var handle = widgetEl.querySelector('.widget-resize-handle');
    if (!handle) return;

    makeCornerResizable(widgetEl, handle, false);

    var topLeftHandle = document.createElement('div');
    topLeftHandle.className = 'widget-resize-handle widget-resize-corner-top-left';
    topLeftHandle.title = 'Drag to resize';
    widgetEl.appendChild(topLeftHandle);
    makeCornerResizable(widgetEl, topLeftHandle, true);

    /* Resize handle on the left edge of corner widgets */
    if (widgetEl.classList.contains('corner-widget')) {
      makeEdgeResizable(widgetEl, 'left');
    }
  }

  function makeCornerResizable(widgetEl, handle, topLeft) {
    handle.addEventListener('pointerdown', function (e) {
      if (!arrangeMode) return;
      e.preventDefault();
      e.stopPropagation();
      ensureDetached(widgetEl);

      var rect = widgetEl.getBoundingClientRect();
      var startX = e.clientX, startY = e.clientY;
      var origLeft = rect.left, origTop = rect.top;
      var origW = rect.width, origH = rect.height;
      var minW = (MIN_SIZES[widgetEl.id] || { w: 120 }).w;
      var minH = (MIN_SIZES[widgetEl.id] || { h: 60 }).h;
      var maxW = (MAX_SIZES[widgetEl.id] || { w: 900 }).w;
      var maxH = (MAX_SIZES[widgetEl.id] || { h: 600 }).h;

      handle.setPointerCapture(e.pointerId);
      handle.classList.add('grabbing');

      showSizeTooltip(origW, origH);

      function onMove(ev) {
        var dx = ev.clientX - startX;
        var dy = ev.clientY - startY;
        var newW = Helpers.clamp(origW + (topLeft ? -dx : dx), minW, maxW);
        var newH = Helpers.clamp(origH + (topLeft ? -dy : dy), minH, maxH);
        widgetEl.style.width = newW + 'px';
        widgetEl.style.height = newH + 'px';
        if (topLeft) {
          widgetEl.style.left = (origLeft + origW - newW) + 'px';
          widgetEl.style.top = (origTop + origH - newH) + 'px';
        }
        clampWidgetToViewport(widgetEl, false);
        updateSizeTooltip(newW, newH);
      }

      function onUp() {
        handle.releasePointerCapture(e.pointerId);
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onUp);
        handle.classList.remove('grabbing');
        hideSizeTooltip();
        saveSize(widgetEl.id, widgetEl.style.width, widgetEl.style.height);
        savePosition(widgetEl.id, widgetEl.style.left, widgetEl.style.top);
      }

      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', onUp);
    });
  }

  /* ==================== EDGE RESIZE (left edge for corner widgets) ==================== */

  function makeEdgeResizable(widgetEl, edge) {
    var edgeHandle = document.createElement('div');
    edgeHandle.className = 'widget-resize-handle widget-resize-edge-' + edge;
    edgeHandle.title = 'Drag to resize';
    edgeHandle.style.cssText = 'position:absolute;top:0;' + edge + ':0;width:8px;height:100%;z-index:55;display:none;cursor:' + (edge === 'left' ? 'ew-resize' : 'ew-resize') + ';border-radius:0;';

    widgetEl.appendChild(edgeHandle);

    /* Show/hide with arrange mode via mutation or class check */
    var ro = new MutationObserver(function () {
      edgeHandle.style.display = arrangeMode ? 'block' : 'none';
    });
    ro.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    edgeHandle.addEventListener('pointerdown', function (e) {
      if (!arrangeMode) return;
      e.preventDefault();
      e.stopPropagation();
      ensureDetached(widgetEl);

      var rect = widgetEl.getBoundingClientRect();
      var startX = e.clientX;
      var origLeft = rect.left;
      var origW = rect.width;
      var minW = (MIN_SIZES[widgetEl.id] || { w: 200 }).w;
      var maxW = (MAX_SIZES[widgetEl.id] || { w: 900 }).w;

      edgeHandle.setPointerCapture(e.pointerId);
      edgeHandle.classList.add('grabbing');
      showSizeTooltip(origW, rect.height);

      function onMove(ev) {
        var dx = ev.clientX - startX;
        var newW = Helpers.clamp(origW - dx, minW, maxW);
        var newLeft = origLeft + (origW - newW);
        widgetEl.style.width = newW + 'px';
        widgetEl.style.left = newLeft + 'px';
        updateSizeTooltip(newW, parseFloat(widgetEl.style.height) || rect.height);
      }

      function onUp() {
        edgeHandle.releasePointerCapture(e.pointerId);
        edgeHandle.removeEventListener('pointermove', onMove);
        edgeHandle.removeEventListener('pointerup', onUp);
        edgeHandle.classList.remove('grabbing');
        hideSizeTooltip();
        saveSize(widgetEl.id, widgetEl.style.width, widgetEl.style.height);
        savePosition(widgetEl.id, widgetEl.style.left, widgetEl.style.top);
      }

      edgeHandle.addEventListener('pointermove', onMove);
      edgeHandle.addEventListener('pointerup', onUp);
    });
  }

  /* ==================== SIZE TOOLTIP ==================== */

  function showSizeTooltip(w, h) {
    if (!sizeTooltip) {
      sizeTooltip = document.createElement('div');
      sizeTooltip.className = 'size-tooltip';
      document.body.appendChild(sizeTooltip);
    }
    updateSizeTooltip(w, h);
    sizeTooltip.style.display = 'block';
  }

  function updateSizeTooltip(w, h) {
    if (!sizeTooltip) return;
    sizeTooltip.textContent = Math.round(w) + ' × ' + Math.round(h);
    /* Position near the cursor — updated on next mouse move via a global listener */
  }

  function hideSizeTooltip() {
    if (sizeTooltip) sizeTooltip.style.display = 'none';
  }

  /* Track cursor for tooltip positioning */
  document.addEventListener('mousemove', function (e) {
    if (sizeTooltip && sizeTooltip.style.display === 'block') {
      sizeTooltip.style.left = (e.clientX + 14) + 'px';
      sizeTooltip.style.top = (e.clientY + 14) + 'px';
    }
  });

  /* ==================== ARRANGE MODE ==================== */

  function setArrangeMode(on) {
    arrangeMode = on;
    document.body.classList.toggle('arrange-mode', on);
    if (!on) {
      movableWidgets.forEach(function (el) {
        clampWidgetToViewport(el, true);
        /* Persist any size changes too */
        if (el.classList.contains('detached')) {
          saveSize(el.id, el.style.width || el.offsetWidth, el.style.height || el.offsetHeight);
        }
      });
      Helpers.showHint(hintEl, 'Widget positions locked');
    }
  }

  function toggleArrangeMode() {
    setArrangeMode(!arrangeMode);
    return arrangeMode;
  }

  function isArrangeMode() {
    return arrangeMode;
  }

  return {
    init: init,
    loadPositions: loadPositions,
    setArrangeMode: setArrangeMode,
    toggleArrangeMode: toggleArrangeMode,
    isArrangeMode: isArrangeMode
  };
})();
