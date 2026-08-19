(function () {
  var settings = {};
  var hintEl = null;
  var bgWidget = null;

  async function init() {
    hintEl = document.getElementById('hint');

    settings = await Storage.loadSettings();

    bgWidget = BackgroundWidget;
    bgWidget.init({
      bgImage: document.getElementById('bg-image'),
      bgVideo: document.getElementById('bg-video'),
      hintEl: hintEl,
      onAccentChange: function () {
        AccentEngine.applyForMode(settings, bgWidget);
      }
    });

    ClockWidget.init({
      clockEl: document.getElementById('clock'),
      dateEl: document.getElementById('date'),
      calPopover: document.getElementById('calendar-popover'),
      calTitle: document.getElementById('cal-title'),
      calGrid: document.getElementById('cal-grid'),
      calPrev: document.getElementById('cal-prev'),
      calNext: document.getElementById('cal-next'),
      settings: settings
    });

    GithubWidget.init({
      widgetEl: document.getElementById('github-widget'),
      graphEl: document.getElementById('github-graph'),
      totalEl: document.getElementById('github-total'),
      streakColEl: document.getElementById('github-streak-col')
    });

    LeetcodeWidget.init({
      widgetEl: document.getElementById('leetcode-widget'),
      graphEl: document.getElementById('leetcode-graph'),
      barsEl: document.getElementById('leetcode-bars'),
      totalEl: document.getElementById('leetcode-total'),
      streakColEl: document.getElementById('leetcode-streak-col')
    });

    var pomoData = await Storage.loadPomodoro();
    PomodoroWidget.init({
      widgetEl: document.getElementById('pomodoro-widget'),
      timeEl: document.getElementById('pomo-time'),
      startBtn: document.getElementById('pomo-start'),
      resetBtn: document.getElementById('pomo-reset'),
      tabsEl: document.querySelector('.pomo-tabs'),
      hintEl: hintEl,
      durations: {
        work: pomoData.workDuration,
        short: pomoData.shortDuration,
        long: pomoData.longDuration
      }
    });

    ShortcutModal.init({
      overlayEl: document.getElementById('modal-overlay'),
      titleEl: document.getElementById('modal-title'),
      urlInput: document.getElementById('input-url'),
      nameInput: document.getElementById('input-name'),
      iconPreview: document.getElementById('icon-preview'),
      iconFileInput: document.getElementById('icon-file-input'),
      uploadBtn: document.getElementById('upload-icon-btn'),
      useDefaultBtn: document.getElementById('use-default-icon-btn'),
      saveBtn: document.getElementById('save-btn'),
      hintEl: hintEl,
      onSave: function (data) {
        if (data.id) {
          ShortcutsManager.updateShortcut(data.id, data.url, data.name, data.icon);
        } else {
          ShortcutsManager.addShortcut(data.url, data.name, data.icon);
        }
      }
    });

    ShortcutsManager.init({
      shortcutsEl: document.getElementById('shortcuts'),
      onEdit: function (sc) {
        ShortcutModal.open(sc);
      }
    });

    WidgetDrag.init({
      hintEl: hintEl,
      widgets: [
        document.getElementById('pomodoro-widget'),
        document.getElementById('github-widget'),
        document.getElementById('leetcode-widget'),
        document.getElementById('clock-wrap'),
        document.getElementById('search-form'),
        document.getElementById('shortcuts-wrap')
      ]
    });

    applySettings();
    await ShortcutsManager.load();
    await bgWidget.load();
    AccentEngine.applyForMode(settings, bgWidget);

    if (settings.showGithub) {
      GithubWidget.load(settings.githubUsername);
    }
    if (settings.showLeetcode) {
      LeetcodeWidget.load(settings.leetcodeUsername);
    }

    await WidgetDrag.loadPositions();
    setupControls();
  }

  function applySettings() {
    ClockWidget.updateSettings(settings);
    document.getElementById('search-form').style.display = settings.showSearchBar ? '' : 'none';
    PomodoroWidget.setVisible(settings.showPomodoro);
    GithubWidget.setVisible(settings.showGithub);
    LeetcodeWidget.setVisible(settings.showLeetcode);
  }

  function setupControls() {
    document.getElementById('settings-btn').addEventListener('click', openSettings);
    document.getElementById('settings-close-btn').addEventListener('click', closeSettings);
    document.getElementById('settings-overlay').addEventListener('click', function (e) {
      if (e.target.id === 'settings-overlay') closeSettings();
    });

    document.getElementById('bg-btn').addEventListener('click', function () {
      document.getElementById('bg-file-input').click();
    });
    document.getElementById('bg-clear-btn').addEventListener('click', function () {
      bgWidget.clear();
    });

    document.getElementById('bg-file-input').addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var isVideo = file.type.startsWith('video/');
      var isImage = file.type.startsWith('image/');
      if (!isVideo && !isImage) {
        Helpers.showHint(hintEl, 'Unsupported file type');
        return;
      }
      var reader = new FileReader();
      reader.onload = function (ev) {
        bgWidget.apply(isVideo ? 'video' : 'image', ev.target.result, true);
      };
      reader.onerror = function () { Helpers.showHint(hintEl, 'Could not read file'); };
      reader.readAsDataURL(file);
      e.target.value = '';
    });

    document.getElementById('arrange-btn').addEventListener('click', function () {
      WidgetDrag.toggleArrangeMode();
      this.classList.toggle('active', WidgetDrag.isArrangeMode());
      this.title = WidgetDrag.isArrangeMode() ? 'Lock widget positions' : 'Move widgets';
    });

    document.getElementById('search-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var q = document.getElementById('search-input').value.trim();
      if (!q) return;
      window.location.href = 'https://www.google.com/search?q=' + encodeURIComponent(q);
    });
  }

  function openSettings() {
    syncSettingsUI();
    document.getElementById('settings-overlay').classList.add('open');
  }

  function closeSettings() {
    document.getElementById('settings-overlay').classList.remove('open');
  }

  function syncSettingsUI() {
    document.querySelectorAll('#clock-format-toggle button').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.format === settings.clockFormat);
    });
    document.getElementById('searchbar-toggle').checked = settings.showSearchBar;
    document.getElementById('pomodoro-toggle').checked = settings.showPomodoro;
    document.getElementById('github-toggle').checked = settings.showGithub;
    document.getElementById('github-username-input').value = settings.githubUsername;
    document.getElementById('github-username-row').style.display = settings.showGithub ? 'block' : 'none';
    document.getElementById('leetcode-toggle').checked = settings.showLeetcode;
    document.getElementById('leetcode-username-input').value = settings.leetcodeUsername;
    document.getElementById('leetcode-username-row').style.display = settings.showLeetcode ? 'block' : 'none';

    document.querySelectorAll('#accent-mode-toggle button').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.mode === (settings.accentMode || 'default'));
    });
    document.getElementById('accent-custom-row').style.display = settings.accentMode === 'custom' ? 'block' : 'none';
    document.getElementById('accent-color-input').value = settings.accentColor || AccentEngine.DEFAULT_ACCENT;

    setupSettingsListeners();
  }

  function setupSettingsListeners() {
    var listenersAttached = document.getElementById('settings-overlay').dataset.listeners === '1';
    if (listenersAttached) return;
    document.getElementById('settings-overlay').dataset.listeners = '1';

    document.querySelectorAll('#clock-format-toggle button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        settings.clockFormat = btn.dataset.format;
        syncSettingsUI();
        Storage.saveSettings(settings);
        ClockWidget.updateSettings(settings);
      });
    });

    document.getElementById('searchbar-toggle').addEventListener('change', function (e) {
      settings.showSearchBar = e.target.checked;
      applySettings();
      Storage.saveSettings(settings);
    });

    document.getElementById('pomodoro-toggle').addEventListener('change', function (e) {
      settings.showPomodoro = e.target.checked;
      applySettings();
      Storage.saveSettings(settings);
    });

    document.getElementById('github-toggle').addEventListener('change', function (e) {
      settings.showGithub = e.target.checked;
      syncSettingsUI();
      Storage.saveSettings(settings);
      if (settings.showGithub) {
        GithubWidget.load(settings.githubUsername);
      } else {
        GithubWidget.setVisible(false);
      }
    });

    document.getElementById('github-username-input').addEventListener('change', function (e) {
      settings.githubUsername = e.target.value.trim();
      Storage.saveSettings(settings);
      if (settings.showGithub) {
        GithubWidget.load(settings.githubUsername);
      }
    });

    document.getElementById('leetcode-toggle').addEventListener('change', function (e) {
      settings.showLeetcode = e.target.checked;
      syncSettingsUI();
      Storage.saveSettings(settings);
      if (settings.showLeetcode) {
        LeetcodeWidget.load(settings.leetcodeUsername);
      } else {
        LeetcodeWidget.setVisible(false);
      }
    });

    document.getElementById('leetcode-username-input').addEventListener('change', function (e) {
      settings.leetcodeUsername = e.target.value.trim();
      Storage.saveSettings(settings);
      if (settings.showLeetcode) {
        LeetcodeWidget.load(settings.leetcodeUsername);
      }
    });

    document.querySelectorAll('#accent-mode-toggle button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        settings.accentMode = btn.dataset.mode;
        syncSettingsUI();
        Storage.saveSettings(settings);
        AccentEngine.applyForMode(settings, bgWidget);
      });
    });

    document.getElementById('accent-color-input').addEventListener('input', function (e) {
      settings.accentColor = e.target.value;
      if (settings.accentMode === 'custom') {
        AccentEngine.applyColor(settings.accentColor);
      }
    });

    document.getElementById('accent-color-input').addEventListener('change', function (e) {
      settings.accentColor = e.target.value;
      Storage.saveSettings(settings);
      if (settings.accentMode === 'custom') {
        AccentEngine.applyColor(settings.accentColor);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
