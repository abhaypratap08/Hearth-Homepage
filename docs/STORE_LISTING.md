# Hearth — Store Listing

## Extension Name

**Hearth**

## Short Description

A minimal, private, customizable new tab page. No accounts, no tracking.

## Long Description

Hearth replaces your browser's new tab page with a clean, fast, customizable homepage.

**What you get:**
- Large minimal clock with calendar
- Google search bar
- Customizable shortcut tiles with automatic favicons
- Image and video backgrounds
- Accent color customization
- GitHub contribution graph with streaks
- LeetCode activity stats with heatmap
- Pomodoro focus timer
- Drag-and-drop widget arrangement

**What you don't get:**
- Accounts or sign-ups
- Analytics or tracking
- Ads or upsells
- Bloated feature lists
- Backend servers collecting your data

Everything runs locally in your browser. Your settings, shortcuts, and backgrounds stay on your device.

## Feature List

- Minimal clock and date display
- Clickable calendar popover
- Google search integration
- Shortcut tiles with drag-to-reorder
- Custom favicon upload per shortcut
- Automatic favicon retrieval
- Custom image backgrounds
- Custom video backgrounds
- Accent color: default, wallpaper-derived, or custom
- GitHub contribution heatmap and streaks
- LeetCode solved-problem stats and activity heatmap
- Pomodoro timer (focus, short break, long break)
- Arrange mode for widget positioning
- Widget position persistence
- Fully offline for core functionality
- Privacy-first: no accounts, no tracking, no telemetry

## Privacy Statement

Hearth is privacy-first. It stores all settings locally using browser extension storage. It contacts three external APIs (GitHub contributions, LeetCode stats, Google Favicons) only to display data you explicitly request. No analytics, no tracking, no data collection. See the full privacy policy in the extension repository.

## Permission Justification

| Permission | Justification |
|-----------|--------------|
| `storage` | Stores user settings, shortcuts, and preferences locally |
| Host permission: `github-contributions-api.jogruber.de` | Fetches GitHub contribution data for the optional GitHub widget |
| Host permission: `leetcode-stats.tashif.codes` | Fetches LeetCode activity data for the optional LeetCode widget |
| Host permission: `www.google.com/s2/favicons*` | Retrieves website favicons for shortcut tiles |

No other permissions are requested. Hearth does not access tabs, history, bookmarks, cookies, or any browsing data.

## Category

Productivity

## Keywords

new tab, homepage, start page, clock, calendar, shortcuts, github, leetcode, pomodoro, timer, privacy, minimal, custom background, accent color

## Screenshots (suggested)

1. Main view with clock, search bar, and shortcut tiles
2. GitHub contribution widget and LeetCode widget active
3. Settings panel showing customization options
4. Custom background with accent color derived from wallpaper

## Promotional Image (suggested)

1280x800 — Hearth logo on a dark glassmorphism background with the clock and shortcuts visible.

## Version

1.0.0

## Supported Browsers

- Google Chrome (Manifest V3)
- Microsoft Edge (Manifest V3)
- Brave (Manifest V3)
- Opera (Manifest V3)
- Firefox (Manifest V3, Gecko)
