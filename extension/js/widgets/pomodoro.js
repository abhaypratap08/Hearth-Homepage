window.PomodoroWidget = (function () {
  var widgetEl = null;
  var timeEl = null;
  var startBtn = null;
  var resetBtn = null;
  var tabsEl = null;
  var hintEl = null;

  var mode = 'work';
  var secondsLeft = 25 * 60;
  var running = false;
  var timer = null;
  var durations = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
  var pomodoroStateKey = 'hearth.pomodoro.active.v1';

  function init(config) {
    widgetEl = config.widgetEl;
    timeEl = config.timeEl;
    startBtn = config.startBtn;
    resetBtn = config.resetBtn;
    tabsEl = config.tabsEl;
    hintEl = config.hintEl;
    durations = config.durations || durations;

    tabsEl.querySelectorAll('.pomo-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        switchMode(tab.dataset.mode);
      });
    });

    startBtn.addEventListener('click', toggleStart);
    resetBtn.addEventListener('click', reset);

    restoreState();
    render();
  }

  function switchMode(newMode) {
    mode = newMode;
    secondsLeft = durations[mode];
    running = false;
    clearTimer();
    tabsEl.querySelectorAll('.pomo-tab').forEach(function (t) {
      t.classList.toggle('active', t.dataset.mode === mode);
    });
    saveState();
    render();
  }

  function toggleStart() {
    if (running) {
      running = false;
      clearTimer();
      saveState();
      render();
      return;
    }
    running = true;
    var endTs = Date.now() + secondsLeft * 1000;
    saveActiveState(endTs);
    render();
    startCountdown(endTs);
  }

  function startCountdown(endTs) {
    clearTimer();
    function tick() {
      var remaining = Math.round((endTs - Date.now()) / 1000);
      if (remaining <= 0) {
        secondsLeft = 0;
        running = false;
        clearTimer();
        render();
        Helpers.showHint(hintEl, mode === 'work' ? 'Focus session complete \u2014 take a break' : 'Break complete \u2014 back to focus');
        saveState();
        return;
      }
      secondsLeft = remaining;
      render();
      timer = setTimeout(tick, 500);
    }
    tick();
  }

  function reset() {
    running = false;
    clearTimer();
    secondsLeft = durations[mode];
    saveState();
    render();
  }

  function clearTimer() {
    if (timer) { clearTimeout(timer); timer = null; }
  }

  function render() {
    timeEl.textContent = Helpers.formatTime(secondsLeft);
    startBtn.textContent = running ? 'Pause' : 'Start';
  }

  async function saveState() {
    try {
      var state = {
        mode: mode,
        secondsLeft: secondsLeft,
        running: running,
        durations: durations
      };
      if (running) {
        state.endTimestamp = Date.now() + secondsLeft * 1000;
      }
      var obj = {};
      obj[pomodoroStateKey] = state;
      await browserAPI.storage.set(obj);
    } catch (e) { }
  }

  async function saveActiveState(endTs) {
    try {
      var state = {
        mode: mode,
        secondsLeft: secondsLeft,
        running: true,
        endTimestamp: endTs,
        durations: durations
      };
      var obj = {};
      obj[pomodoroStateKey] = state;
      await browserAPI.storage.set(obj);
    } catch (e) { }
  }

  async function restoreState() {
    try {
      var result = await browserAPI.storage.get(pomodoroStateKey);
      var state = result[pomodoroStateKey];
      if (!state) return;

      if (state.durations) {
        durations = state.durations;
      }

      mode = state.mode || 'work';
      tabsEl.querySelectorAll('.pomo-tab').forEach(function (t) {
        t.classList.toggle('active', t.dataset.mode === mode);
      });

      if (state.running && state.endTimestamp) {
        var remaining = Math.round((state.endTimestamp - Date.now()) / 1000);
        if (remaining > 0) {
          secondsLeft = remaining;
          running = true;
          render();
          startCountdown(state.endTimestamp);
          return;
        }
      }

      secondsLeft = state.secondsLeft || durations[mode];
      running = false;
      render();
    } catch (e) {
      render();
    }
  }

  function setVisible(visible) {
    widgetEl.classList.toggle('visible', visible);
  }

  return {
    init: init,
    setVisible: setVisible
  };
})();
