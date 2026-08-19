# Changelog

## 1.0.0 — 2026-08-19

First open-source release.

- In-app upload panel (sidebar footer action): pick two images — square icon
  (tab favicon + collapsed rail) and wide logo (expanded sidebar top).
- Browser-side canvas processing: square center-crop to 256×256, wide
  proportional scale ≤1080×126; zero server image dependencies.
- Loopback-only upload/reset endpoints with PNG magic-number validation,
  8MB cap and filename whitelist; `GET /custom-logo/state` for previews.
- Dynamic index.html tap: injects only the surfaces that have an image,
  with `?v=<mtime>` cache busting — no restart, no manual file prep.
- `Reset to default` removes managed files while keeping unrelated ones.
- Portable `<DSH_HOME>` resolution (no hardcoded user paths).
- zh/en localization; MIT license; npm + GitHub install channels.

## 0.2.1 — 2026-08-19

- Sidebar brand logo sized to 42px (fills the 44px content row); collapsed
  rail uses the square logo; `*=` contains-matching selectors survive
  class-order changes; `min-height` guards against brand-row collapse.

## 0.1.0 — 2026-08-19

- Initial internal version: serves fixed-name PNGs from
  `<DSH_HOME>/branding/`, rewrites the favicon link and injects CSS that
  hides the shipped brand SVGs.
