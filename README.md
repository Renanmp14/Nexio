<h1 align="center">Nexio</h1>

<p align="center">
  <strong>A minimalist desktop browser built to be direct, fast, and user-centered.</strong>
</p>

<p align="center">
  <img alt="Electron" src="https://img.shields.io/badge/Electron-29.x-191970?logo=electron&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-18.x-20232A?logo=react&logoColor=61DAFB" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white" />
  <img alt="Status" src="https://img.shields.io/badge/Status-Active-2e7d32" />
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#features">Features</a> •
  <a href="#roadmap">Roadmap</a> •
  <a href="#suggestions">Suggestions</a>
</p>

## Author

Renan Milech Pereira

## Why Nexio

Nexio is a minimal browser focused on real client workflows.

It is built around four priorities:
- Clean interface
- Quick navigation
- Practical controls
- Useful customization without visual noise

## Quick Start

### Requirements

- Node.js LTS
- npm (included with Node.js)

Install Node.js from https://nodejs.org/ and verify:

```bash
node -v
npm -v
```

### Install

```bash
npm install
```

### Run (Development)

```bash
npm run dev
```

Starts both:
- Vite frontend server
- Electron desktop window

### Build (Production)

```bash
npm run build
```

Windows note: packaging can require symlink permissions depending on your system policy.

## Core Idea

Nexio avoids feature bloat and prioritizes:
- Fast multi-tab browsing
- Straightforward URL/search flow
- Explicit data control (sites, logins, cookies, cache)
- A visual system that can evolve without clutter

## Features

| Category | What You Get |
|---|---|
| Navigation | Frameless desktop window, multi-tab browsing, URL and search input |
| Interface | Theme support and focused settings page |
| Data Control | Category-based browser data visualization |
| Data Actions | Item-by-item deletion, group deletion, delete all groups |

## Project Structure

```text
Nexio/
  electron/
    main.js
    preload.js
  src/
    components/
      NavigationBar.jsx
      SettingsPanel.jsx
      TabBar.jsx
      WebView.jsx
    context/
      BrowserContext.jsx
    icons/
      CustomIcons.jsx
    pages/
      Settings.jsx
    themes/
      themes.js
    App.jsx
    main.jsx
    index.css
  index.html
  vite.config.js
  package.json
```

## Architecture Overview

| Layer | File/Folder | Responsibility |
|---|---|---|
| Main Process | `electron/main.js` | Window lifecycle, session control, IPC handlers |
| Preload Bridge | `electron/preload.js` | Safe API bridge exposed as `window.electronAPI` |
| App Entry | `src/main.jsx` | React bootstrap, router, providers |
| App Shell | `src/App.jsx` | Main route composition |
| State | `src/context/BrowserContext.jsx` | Tabs, theme, active state management |
| Browser UI | `src/components/` | Navigation bar, tabs, webview rendering |
| Settings UI | `src/pages/Settings.jsx` | Theme and browser-data management |
| Themes | `src/themes/themes.js` | Theme palettes and visual tokens |

## Main Technologies

- Electron
- React
- React Router
- Vite
- electron-builder

## Roadmap

### Release Plan

| Phase | Status | Focus | Planned Improvements |
|---|---|---|---|
| Phase 1 | In progress | Stability and Performance | Improve long-session stability, optimize startup, reduce memory usage |
| Phase 2 | Planned | Productivity | Favorite/pinned tabs, keyboard-first shortcuts, smoother tab workflows |
| Phase 3 | Planned | UX and Identity | Stronger visual identity, cleaner consistency, interaction polish |
| Phase 4 | Planned | Power Features | Developer mode, secure extension-permission model, optional profile sync/export |

### Detailed Backlog

- [ ] Improve stability during long browsing sessions
- [ ] Increase rendering and navigation performance
- [ ] Add favorite tabs and pinned tabs
- [ ] Introduce a stronger and consistent visual identity
- [ ] Add a focused mode for developers
- [ ] Add a secure extension-permission model
- [ ] Improve startup time and memory usage
- [ ] Add optional export/sync for preferences
- [ ] Add keyboard-first productivity shortcuts
- [ ] Add a lightweight privacy mode profile

## Suggestions

Suggestions are welcome.

To propose an improvement, include:
- Problem to solve
- Why it matters
- Suggested behavior
- Optional UI flow or mockup

This helps keep Nexio practical, clean, and genuinely useful for real users.
