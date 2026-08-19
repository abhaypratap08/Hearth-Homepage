window.LeetcodeWidget = (function () {
  var widgetEl = null;
  var graphEl = null;
  var barsEl = null;
  var totalEl = null;
  var streakColEl = null;
  var LEETCODE_API_BASE = 'https://leetcode-stats.tashif.codes/';

  function init(config) {
    widgetEl = config.widgetEl;
    graphEl = config.graphEl;
    barsEl = config.barsEl;
    totalEl = config.totalEl;
    streakColEl = config.streakColEl;
  }

  function setVisible(visible) {
    widgetEl.classList.toggle('visible', visible);
  }

  function setLoading() {
    totalEl.textContent = '';
    streakColEl.textContent = '';
    graphEl.textContent = '';
    barsEl.textContent = '';
    var loading = document.createElement('div');
    loading.className = 'widget-loading';
    loading.textContent = 'Loading\u2026';
    graphEl.appendChild(loading);
  }

  function setError(target, msg) {
    target.textContent = '';
    var err = document.createElement('div');
    err.className = 'widget-error';
    err.textContent = msg;
    target.appendChild(err);
  }

  function fetchWithTimeout(url, ms) {
    return fetch(url, { signal: AbortSignal.timeout(ms) });
  }

  function load(username) {
    if (!username) {
      setVisible(false);
      return;
    }
    setVisible(true);
    setLoading();

    var base = LEETCODE_API_BASE + encodeURIComponent(username);

    fetchWithTimeout(base + '/stats', 6000)
      .then(function (r) {
        if (!r.ok) throw new Error('lookup failed');
        return r.json();
      })
      .then(function (json) {
        if (json.status !== 'success' || !json.data) throw new Error('lookup failed');
        renderStats(json.data);
      })
      .catch(function () {
        setError(barsEl, 'Could not load LeetCode stats');
      });

    fetchWithTimeout(base + '/heatmap', 6000)
      .then(function (r) {
        if (!r.ok) throw new Error('lookup failed');
        return r.json();
      })
      .then(function (json) {
        if (json.status !== 'success' || !json.data) throw new Error('lookup failed');
        renderHeatmap(json.data);
      })
      .catch(function () {
        setError(graphEl, 'Could not load LeetCode activity');
      });
  }

  function renderStats(data) {
    totalEl.textContent = data.totalQuestions
      ? (data.totalSolved || 0) + '/' + data.totalQuestions
      : (data.totalSolved || 0) + ' solved';

    var byDiff = data.byDifficulty || {};
    var cats = [
      { label: 'Easy', solved: byDiff.easy || 0, color: '#3ddc84' },
      { label: 'Medium', solved: byDiff.medium || 0, color: 'var(--accent)' },
      { label: 'Hard', solved: byDiff.hard || 0, color: 'var(--danger)' }
    ];
    var maxSolved = Math.max(1, cats[0].solved, cats[1].solved, cats[2].solved);

    barsEl.textContent = '';
    cats.forEach(function (c) {
      var pct = Math.round((c.solved / maxSolved) * 100);
      var row = document.createElement('div');
      row.className = 'lc-row';

      var rowLabel = document.createElement('div');
      rowLabel.className = 'lc-row-label';
      var labelText = document.createElement('span');
      labelText.textContent = c.label;
      var countText = document.createElement('span');
      countText.textContent = c.solved;
      rowLabel.appendChild(labelText);
      rowLabel.appendChild(countText);

      var track = document.createElement('div');
      track.className = 'lc-bar-track';
      var fill = document.createElement('div');
      fill.className = 'lc-bar-fill';
      fill.style.width = pct + '%';
      fill.style.background = c.color;
      track.appendChild(fill);

      row.appendChild(rowLabel);
      row.appendChild(track);
      barsEl.appendChild(row);
    });
  }

  function renderHeatmap(data) {
    var days = Array.isArray(data.dailyContributions) ? data.dailyContributions : [];
    if (!days.length) {
      graphEl.textContent = '';
      var err = document.createElement('div');
      err.className = 'widget-error';
      err.textContent = 'No activity data found';
      graphEl.appendChild(err);
      return;
    }

    var currentStreak = data.currentStreak || 0;
    var longestStreak = data.longestStreak || 0;

    Helpers.renderStreakCol(streakColEl, currentStreak, longestStreak, 'longest');

    var weeks = [];
    var currentWeek = [];
    days.forEach(function (day, idx) {
      currentWeek.push(day);
      var dow = new Date(day.date + 'T00:00:00').getDay();
      if (dow === 6 || idx === days.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    graphEl.textContent = '';
    weeks.forEach(function (week) {
      var col = document.createElement('div');
      col.className = 'contrib-col';
      week.forEach(function (day) {
        var level = Helpers.clamp(day.level || 0, 0, 4);
        var cell = document.createElement('div');
        cell.className = 'contrib-cell level-' + level;
        var shade = Helpers.shadeForLevel(level);
        if (shade) cell.style.background = shade;
        cell.title = day.date + ': ' + (day.count || 0) + ' submissions';
        col.appendChild(cell);
      });
      graphEl.appendChild(col);
    });
    Helpers.scrollGraphToEnd(graphEl);
  }

  return {
    init: init,
    load: load,
    setVisible: setVisible
  };
})();
