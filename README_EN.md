<p align="center">
  <img src="./assets/readme/hero.svg" width="100%" alt="dsh-custom-logo: upload two pictures and the dsh favicon and sidebar logo are replaced — default branding becomes yours">
</p>

<h3 align="center">Two pictures in, the whole DeepSeek Harness branding out</h3>

<p align="center">
  <img src="https://img.shields.io/npm/v/dsh-custom-logo.svg?color=4D6BFE&style=for-the-badge" alt="npm version">
  <img src="https://img.shields.io/badge/license-MIT-FFB454?style=for-the-badge" alt="MIT License">
  <img src="https://img.shields.io/badge/dependencies-0-8C97AE?style=for-the-badge" alt="zero dependencies">
  <img src="https://img.shields.io/badge/platform-dsh%20web-101A2E?style=for-the-badge" alt="dsh web platform">
</p>

<p align="center">English · <a href="./README.md"><strong>简体中文</strong></a></p>

---

Put your own branding on [DeepSeek Harness](https://github.com/deepseek-ai) (dsh): after install a **Branding** section appears in the settings dialog (alongside General / Models / Plugins). Pick one square image and one wide image — the plugin crops, scales, and swaps the favicon and sidebar logo automatically. **No image editing, no restart, survives upgrades.**

## Two pictures, three surfaces

<p align="center">
  <img src="./assets/readme/flow.svg" width="100%" alt="Two upload cards flow through in-browser Canvas processing and replace three surfaces: the browser favicon, the expanded sidebar wide logo, and the collapsed rail round icon">
</p>

- **Browser tab** — the square image is center-cropped into the favicon; the bookmark icon updates too
- **Expanded sidebar** — the wide image scales proportionally, replacing the native wordmark at 42px height
- **Collapsed rail** — the square image shrinks into a 36px round icon

All processing happens in the browser. Uploads apply after an automatic page reload — no server restart, no manual sizing.

## Install

**Option 1: from npm (recommended)**

```bash
dsh plugin --profile web add dsh-custom-logo
```

**Option 2: straight from GitHub**

```bash
dsh plugin --profile web add github:dawsondx/dsh-custom-logo
```

**Option 3: clone and add (review source / contribute)**

```bash
git clone https://github.com/dawsondx/dsh-custom-logo.git
dsh plugin --profile web add ./dsh-custom-logo
```

Restart dsh afterwards (`dsh start --profile web`) and the Branding section appears in the settings dialog.

## Usage

1. Open the settings dialog and pick **Branding** in the left nav
2. **Web icon** card → choose an image → processed and applied automatically
3. **Sidebar logo** card → choose an image → processed and applied automatically
4. Re-upload any time; **Reset to default** restores the originals

Current images are shown as thumbnails; the panel is localized (zh/en) following the dsh UI language.

## How it works

- The client resizes the picked image to a standard PNG via canvas (square 256×256 center-crop; wide ≤1080×126 proportional) and POSTs it to the local dsh server
- The server writes `<DSH_HOME>/branding/` (`logo-128.png` / `logo-64.png` / `logo-wide.png`) atomically
- Every index request is tapped dynamically: the favicon `<link>` is rewritten and CSS hides the native SVGs (matched by stable `viewBox` attributes, immune to build hashes and class order), painting your images instead, with `?v=<mtime>` cache busting
- Images live in the dsh user directory, not inside the plugin package, so plugin updates never lose them; the plugin itself mounts through the user profile patch layer, which dsh upgrades never overwrite

## Security

- Upload/reset endpoints accept **loopback peers only** (peer socket address check, not the spoofable Host header) — LAN visitors cannot touch your branding
- PNG magic-number validation, 8MB per-upload cap, filename whitelist, no arbitrary paths

## FAQ

**Nothing changed after upload?** Hard-refresh once (Ctrl+Shift+R). Injected URLs carry a version query, so a normal reload usually suffices.

**What aspect ratio for the wide logo?** The brand row is 42px tall; 3:1 (e.g. 126×42, 540×180) fills it best. Wider images scale down proportionally without distortion.

**The rail icon looks tiny?** The collapsed rail is a 36px round slot; keep the square image's subject away from the edges.

**How to uninstall?** `dsh plugin --profile web remove dsh-custom-logo`, then delete `logo-*.png` under `~/.dsh/branding/` for a full restore.

**Does it survive dsh upgrades?** The plugin mounts through the user profile patch layer; dsh's own upgrades do not overwrite it. CSS anchors use stable attributes, so minor UI updates are usually fine. If a dsh redesign breaks it, please open an issue.

## Development

```bash
git clone https://github.com/dawsondx/dsh-custom-logo.git
cd dsh-custom-logo
npm run check   # syntax-check lib/index.js and lib/client.js
```

No build step: `lib/index.js` (host, ESM) and `lib/client.js` (browser, hand-written `__ModuleLoader__` bundle) are single files with zero third-party dependencies.

## Acknowledgements

- Sidebar panel interaction modeled after [dsh-token-data](https://github.com/dawsondx/dsh-token-data)

## License

[MIT](./LICENSE)
