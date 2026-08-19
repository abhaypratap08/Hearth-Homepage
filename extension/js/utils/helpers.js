window.Helpers = (function () {
  var GREEN_SHADES = ['#1a5c34', '#2ea043', '#4ad066', '#7ee787'];

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function pad(n) {
    return n.toString().padStart(2, '0');
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return pad(m) + ':' + pad(s);
  }

  function normalizeUrl(raw) {
    let u = raw.trim();
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    return u;
  }

  function getHostname(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch (e) {
      return url;
    }
  }

  function faviconUrl(hostname) {
    return 'https://www.google.com/s2/favicons?sz=128&domain=' + encodeURIComponent(hostname);
  }

  function generateId() {
    return crypto.randomUUID();
  }

  function shadeForLevel(level) {
    if (!level) return null;
    return GREEN_SHADES[clamp(level, 1, 4) - 1] || null;
  }

  function showHint(hintEl, msg) {
    hintEl.textContent = msg;
    hintEl.classList.add('show');
    clearTimeout(showHint._t);
    showHint._t = setTimeout(function () {
      hintEl.classList.remove('show');
    }, 2400);
  }

  function renderStreakCol(container, current, best, bestLabel, extraStat) {
    container.textContent = '';
    var items = [
      { num: current, label: 'day streak', dim: false },
      { num: best, label: bestLabel, dim: true }
    ];
    if (extraStat !== null && extraStat !== undefined) {
      items.push({ num: extraStat.num, label: extraStat.label, dim: true });
    }
    items.forEach(function (item) {
      var box = document.createElement('div');
      box.className = 'streak-box' + (item.dim ? ' dim' : '');
      var numEl = document.createElement('div');
      numEl.className = 'streak-num';
      numEl.textContent = item.num;
      var labelEl = document.createElement('div');
      labelEl.className = 'streak-label';
      labelEl.textContent = item.label;
      box.appendChild(numEl);
      box.appendChild(labelEl);
      container.appendChild(box);
    });
  }

  function hexToRgb(hex) {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    const num = parseInt(h, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(function (v) {
      return clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
    }).join('');
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    const d = max - min;
    if (d !== 0) {
      s = d / (1 - Math.abs(2 * l - 1));
      switch (max) {
        case r: h = ((g - b) / d) % 6; break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
      if (h < 0) h += 360;
    }
    return { h: h, s: s * 100, l: l * 100 };
  }

  function hslToHex(h, s, l) {
    s = clamp(s, 0, 100) / 100;
    l = clamp(l, 0, 100) / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
  }

  function extractAccentFromImage(imgEl) {
    try {
      const size = 48;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imgEl, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 4) {
        const rr = data[i], gg = data[i + 1], bb = data[i + 2], aa = data[i + 3];
        if (aa < 128) continue;
        const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
        if (max > 245 && min > 235) continue;
        if (max < 18) continue;
        r += rr; g += gg; b += bb; count++;
      }
      if (!count) {
        for (let i = 0; i < data.length; i += 4) {
          r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
        }
      }
      if (!count) return null;
      r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
      const hsl = rgbToHsl(r, g, b);
      const s = clamp(Math.max(50, hsl.s), 0, 100);
      const l = clamp(hsl.l, 42, 64);
      return hslToHex(hsl.h, s, l);
    } catch (e) {
      return null;
    }
  }

  function scrollGraphToEnd(container) {
    requestAnimationFrame(function () {
      container.scrollLeft = container.scrollWidth;
    });
  }

  return {
    clamp: clamp,
    pad: pad,
    formatTime: formatTime,
    normalizeUrl: normalizeUrl,
    getHostname: getHostname,
    faviconUrl: faviconUrl,
    generateId: generateId,
    shadeForLevel: shadeForLevel,
    showHint: showHint,
    renderStreakCol: renderStreakCol,
    hexToRgb: hexToRgb,
    rgbToHex: rgbToHex,
    rgbToHsl: rgbToHsl,
    hslToHex: hslToHex,
    extractAccentFromImage: extractAccentFromImage,
    scrollGraphToEnd: scrollGraphToEnd
  };
})();
