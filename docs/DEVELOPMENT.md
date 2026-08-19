# Development Guide

## Prerequisites

- A Chromium-based browser (Chrome, Edge, Brave, or Opera) or Firefox
- Bash (for build scripts)
- Python 3 (optional, for manifest validation)

## Loading the Extension

### Chromium browsers

1. Open `chrome://extensions` (or `edge://extensions`, `brave://extensions`)
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `extension/` directory from this repository
5. Open a new tab (`Ctrl+T`) to see Hearth

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Navigate into the `extension/` directory and select `manifest.json`
4. Open a new tab to see Hearth

Note: Firefox temporary add-ons are removed when the browser closes. For persistent installation, use the packaged `.zip` file.

## Development Workflow

1. Edit files in the `extension/` directory
2. Go to `chrome://extensions`
3. Click the reload icon on the Hearth extension card
4. Open a new tab to see changes

No build step is required for development. All JS files are loaded directly.

## Project Architecture

### Module System

All JavaScript modules are attached to the `window` object as global namespaces:

- `window.browserAPI` -- Cross-browser API abstraction
- `window.Storage` -- Storage abstraction layer
- `window.Helpers` -- Utility functions
- `window.ClockWidget` -- Clock and calendar
- `window.GithubWidget` -- GitHub contribution graph
- `window.LeetcodeWidget` -- LeetCode activity graph
- `window.PomodoroWidget` -- Pomodoro timer
- `window.BackgroundWidget` -- Background image/video management
- `window.AccentEngine` -- Accent color computation
- `window.WidgetDrag` -- Widget drag-to-move system
- `window.ShortcutsManager` -- Shortcut tile management
- `window.ShortcutModal` -- Add/edit shortcut dialog

### Load Order

Scripts must be loaded in dependency order (see `newtab.html`):

1. `browser-api.js` (no dependencies)
2. `storage.js` (depends on browser-api)
3. `utils/helpers.js` (no dependencies)
4. Widget modules (depend on helpers, storage)
5. `shortcuts/shortcuts.js` (depends on helpers, storage)
6. `shortcuts/modal.js` (depends on helpers)
7. `app.js` (depends on everything above)

### Storage Keys

All storage uses `chrome.storage.local` / `browser.storage.local`:

| Key | Type | Description |
|-----|------|-------------|
| `hearth.shortcuts.v1` | Array | Shortcut objects `{id, url, name, icon?}` |
| `hearth.settings.v1` | Object | All user settings |
| `hearth.background.v1` | Object | `{type, src}` for custom background |
| `hearth.widgetPositions.v1` | Object | Widget ID to viewport fraction mapping |
| `hearth.pomodoro.v1` | Object | Pomodoro durations |
| `hearth.pomodoro.active.v1` | Object | Active timer state (timestamps) |

### Security Model

- No `eval()` or `new Function()` anywhere
- No inline scripts in HTML
- User-provided strings rendered via `textContent`, not `innerHTML`
- CSP enforced via manifest
- No remote JavaScript loading
- Favicon URLs constructed from validated hostnames only

## Building for Distribution

```bash
bash scripts/build.sh
```

This creates:

- `store/chrome/hearth-chrome.zip` -- For Chrome Web Store / Brave / Opera
- `store/firefox/hearth-firefox.zip` -- For Firefox Add-ons (AMO)
- `store/edge/hearth-edge.zip` -- For Microsoft Edge Add-ons

## Validation

```bash
bash scripts/validate.sh
```

Checks:

- Required files exist
- Manifest is valid JSON
- No `eval()` or `new Function()` in JS
- No remote script loading
- Icons present in all required sizes

## Cross-Browser Notes

### Firefox differences

- `browser.storage.local` is preferred over `chrome.storage.local`
- The `browser_specific_settings.gecko` section in manifest is required

### Chromium differences

- `chrome_url_overrides.newtab` for new tab replacement
- Manifest V3 required for Chrome Web Store

## Testing Checklist

- [ ] New tab loads immediately
- [ ] Clock displays correct time
- [ ] Calendar opens on date click
- [ ] Search submits to Google
- [ ] Shortcuts render with favicons
- [ ] Add shortcut works
- [ ] Edit shortcut works
- [ ] Delete shortcut works
- [ ] Drag-to-reorder works
- [ ] Custom background image works
- [ ] Custom background video works
- [ ] Clear background works
- [ ] Accent color changes work
- [ ] Settings persist after reload
- [ ] GitHub widget loads with valid username
- [ ] GitHub widget shows error with invalid username
- [ ] LeetCode widget loads with valid username
- [ ] LeetCode widget shows error with invalid username
- [ ] Pomodoro timer counts down correctly
- [ ] Pomodoro survives tab reload
- [ ] Arrange mode enables drag-to-move
- [ ] Widget positions persist after reload
- [ ] Works on 1366x768 and 1920x1080
