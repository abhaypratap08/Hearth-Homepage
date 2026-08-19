# Hearth Privacy Policy

Last updated: 2026-08-19

## What Hearth stores

Hearth stores the following data **locally in your browser** using the extension storage API (`chrome.storage.local` / `browser.storage.local`):

| Data | Key | Purpose |
|------|-----|---------|
| Shortcuts | `hearth.shortcuts.v1` | Your saved website shortcuts |
| Settings | `hearth.settings.v1` | Clock format, accent color, widget visibility, usernames |
| Background | `hearth.background.v1` | Custom background image or video (stored as base64) |
| Widget positions | `hearth.widgetPositions.v1` | Where you've placed widgets on the page |
| Pomodoro state | `hearth.pomodoro.v1` | Timer state (mode, remaining time, durations) |

All data remains on your device. Nothing is transmitted to any server by Hearth itself.

## What external services Hearth contacts

Hearth makes requests to the following external APIs **only when you enable the corresponding widget**:

### GitHub Contributions API
- **URL:** `https://github-contributions-api.jogruber.de/v4/{username}?y=last`
- **When:** Only when the GitHub widget is enabled and a username is configured
- **What is sent:** Your GitHub username (a public identifier you provide)
- **What is received:** Contribution count data for rendering the heatmap
- **Why:** To display your GitHub contribution graph

### LeetCode Stats API
- **URL:** `https://leetcode-stats.tashif.codes/{username}/stats` and `/heatmap`
- **When:** Only when the LeetCode widget is enabled and a username is configured
- **What is sent:** Your LeetCode username (a public identifier you provide)
- **What is received:** Solved problem counts, streak data, activity heatmap
- **Why:** To display your LeetCode statistics

### Google Favicons
- **URL:** `https://www.google.com/s2/favicons?sz=128&domain={hostname}`
- **When:** When rendering shortcut tiles that don't have a custom icon
- **What is sent:** The hostname of websites in your shortcuts
- **What is received:** A small favicon image
- **Why:** To show website icons next to your shortcuts

### Google Search (on user action only)
- **URL:** `https://www.google.com/search?q={query}`
- **When:** Only when you submit a search query
- **What is sent:** Your search query
- **Why:** To perform web searches (this is the core search functionality)

## What Hearth does NOT collect

- No analytics or telemetry
- No tracking identifiers
- No browsing history
- No personal information beyond what you explicitly configure
- No usage statistics
- No advertising data
- No account information (Hearth has no account system)

## What Hearth does NOT have access to

Hearth requests only the `storage` permission. It does **not** request access to:

- Your tabs or browsing history
- Your bookmarks
- Your cookies
- Your downloads
- Your clipboard
- Your location
- Your camera or microphone
- Any other browser APIs beyond storage

## Data retention

All data persists in your browser until you:

- Manually delete it through the extension settings
- Uninstall the extension
- Clear your browser's extension storage

Hearth has no server-side component. There is no data to retention on our end because we never receive any.

## Changes to this policy

If this privacy policy changes, the changes will be reflected in the extension's repository with an updated date.
