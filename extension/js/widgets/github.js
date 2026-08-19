window.GithubWidget = (function () {
  var widgetEl = null;
  var graphEl = null;
  var totalEl = null;
  var streakColEl = null;

  function init(config) {
    widgetEl = config.widgetEl;
    graphEl = config.graphEl;
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
    var loading = document.createElement('div');
    loading.className = 'widget-loading';
    loading.textContent = 'Loading\u2026';
    graphEl.appendChild(loading);
  }

  function setError(msg) {
    graphEl.textContent = '';
    var err = document.createElement('div');
    err.className = 'widget-error';
    err.textContent = msg;
    graphEl.appendChild(err);
  }

  function load(username) {
    if (!username) {
      setVisible(false);
      return;
    }
    setVisible(true);
    setLoading();

    fetch('https://github-contributions-api.jogruber.de/v4/' + encodeURIComponent(username) + '?y=last')
      .then(function (r) {
        if (!r.ok) throw new Error('lookup failed');
        return r.json();
      })
      .then(function (data) {
        render(data);
      })
      .catch(function () {
        setError('Could not load GitHub data');
      });
  }

  function computeStreaks(days) {
    var maxStreak = 0, running = 0;
    days.forEach(function (d) {
      if ((d.count || 0) > 0) { running++; maxStreak = Math.max(maxStreak, running); }
      else running = 0;
    });
    var idx = days.length - 1;
    if (days[idx] && (days[idx].count || 0) === 0) idx--;
    var currentStreak = 0;
    while (idx >= 0 && (days[idx].count || 0) > 0) { currentStreak++; idx--; }
    return { currentStreak: currentStreak, maxStreak: maxStreak };
  }

  function render(data) {
    var days = Array.isArray(data.contributions) ? data.contributions : [];
    if (!days.length) {
      setError('No contribution data found');
      return;
    }

    var totalCount = 0;
    if (data.total && typeof data.total === 'object') {
      var years = Object.keys(data.total);
      totalCount = years.length ? data.total[years[years.length - 1]] : 0;
    }
    if (!totalCount) totalCount = days.reduce(function (sum, d) { return sum + (d.count || 0); }, 0);

    var currentYearStr = new Date().getFullYear().toString();
    var thisYearCount = days
      .filter(function (d) { return d.date && d.date.startsWith(currentYearStr); })
      .reduce(function (sum, d) { return sum + (d.count || 0); }, 0);

    totalEl.textContent = thisYearCount + ' this yr (' + totalCount + ' total)';

    var streaks = computeStreaks(days);
    Helpers.renderStreakCol(streakColEl, streaks.currentStreak, streaks.maxStreak, 'best', { num: thisYearCount, label: 'this year' });

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
        var level = day.level || 0;
        var cell = document.createElement('div');
        cell.className = 'contrib-cell level-' + level;
        var shade = Helpers.shadeForLevel(level);
        if (shade) cell.style.background = shade;
        cell.title = day.date + ': ' + (day.count || 0) + ' contributions';
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
