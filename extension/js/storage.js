window.Storage = (function () {
  const KEYS = {
    shortcuts: 'hearth.shortcuts.v1',
    background: 'hearth.background.v1',
    settings: 'hearth.settings.v1',
    widgetPositions: 'hearth.widgetPositions.v1',
    pomodoro: 'hearth.pomodoro.v1'
  };

  const DEFAULT_SETTINGS = {
    clockFormat: '24',
    showSearchBar: true,
    showPomodoro: false,
    showGithub: false,
    githubUsername: '',
    showLeetcode: false,
    leetcodeUsername: '',
    accentMode: 'default',
    accentColor: '#ffb454'
  };

  const DEFAULT_SHORTCUTS = [
    { id: 'd1', url: 'https://youtube.com', name: 'YouTube' },
    { id: 'd2', url: 'https://github.com', name: 'GitHub', icon: 'assets/icons8-github-48.png' },
    { id: 'd3', url: 'https://mail.google.com', name: 'Gmail', icon: 'assets/icons8-gmail-48.png' }
  ];

  const DEFAULT_POMODORO = {
    workDuration: 25 * 60,
    shortDuration: 5 * 60,
    longDuration: 15 * 60
  };

  async function load(key) {
    try {
      const result = await browserAPI.storage.get(key);
      return result[key] || null;
    } catch (e) {
      return null;
    }
  }

  async function save(key, value) {
    try {
      const obj = {};
      obj[key] = value;
      await browserAPI.storage.set(obj);
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  async function remove(key) {
    try {
      await browserAPI.storage.remove(key);
    } catch (e) {
      console.warn('Storage remove failed:', e);
    }
  }

  async function loadShortcuts() {
    const data = await load(KEYS.shortcuts);
    return data ? data : DEFAULT_SHORTCUTS.slice();
  }

  async function saveShortcuts(shortcuts) {
    await save(KEYS.shortcuts, shortcuts);
  }

  async function loadSettings() {
    const data = await load(KEYS.settings);
    return data ? Object.assign({}, DEFAULT_SETTINGS, data) : Object.assign({}, DEFAULT_SETTINGS);
  }

  async function saveSettings(settings) {
    await save(KEYS.settings, settings);
  }

  async function loadBackground() {
    return await load(KEYS.background);
  }

  async function saveBackground(type, src) {
    await save(KEYS.background, { type: type, src: src });
  }

  async function clearBackground() {
    await remove(KEYS.background);
  }

  async function loadWidgetPositions() {
    const data = await load(KEYS.widgetPositions);
    return data || {};
  }

  async function saveWidgetPositions(positions) {
    await save(KEYS.widgetPositions, positions);
  }

  async function loadPomodoro() {
    const data = await load(KEYS.pomodoro);
    return data ? Object.assign({}, DEFAULT_POMODORO, data) : Object.assign({}, DEFAULT_POMODORO);
  }

  async function savePomodoro(data) {
    await save(KEYS.pomodoro, data);
  }

  return {
    KEYS: KEYS,
    DEFAULT_SETTINGS: DEFAULT_SETTINGS,
    DEFAULT_SHORTCUTS: DEFAULT_SHORTCUTS,
    DEFAULT_POMODORO: DEFAULT_POMODORO,
    load: load,
    save: save,
    remove: remove,
    loadShortcuts: loadShortcuts,
    saveShortcuts: saveShortcuts,
    loadSettings: loadSettings,
    saveSettings: saveSettings,
    loadBackground: loadBackground,
    saveBackground: saveBackground,
    clearBackground: clearBackground,
    loadWidgetPositions: loadWidgetPositions,
    saveWidgetPositions: saveWidgetPositions,
    loadPomodoro: loadPomodoro,
    savePomodoro: savePomodoro
  };
})();
