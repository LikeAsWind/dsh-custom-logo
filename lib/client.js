/**
 * dsh-custom-logo — browser half.
 *
 * Two responsibilities:
 *
 *   1. A first-level "品牌设置" section in the official settings dialog where
 *      the user picks two images. Each slot is normalized to a fixed target in
 *      the browser (square → 512×512 center-crop; wide → height 72px, width
 *      proportional, capped at 468px) and POSTed to the host half.
 *
 *   2. Occupying the official brand slots (the same mechanism
 *      `@deepseek-ai/dsh-client-ui-brand-official` uses): `sidebar.brand.mark`,
 *      `sidebar.brand.name` and `conversation.hero.brand.mark` are registered
 *      with <img> components whose size is supplied by the slot owner, so the
 *      logo scales exactly like the shipped SVG marks instead of being
 *      hard-coded as a CSS background bitmap.
 *
 * @module dsh-custom-logo/client
 */

window.__ModuleLoader__.load({
  id: "dsh-custom-logo",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    let react = require("react");
    let react_jsx_runtime = require("react/jsx-runtime");

    const NS = "custom-logo";
    const VERSION = "dsh-custom-logo v1.1.0";

    /** Target output sizes per slot (server stores exactly these). */
    const SLOT_TARGET = {
      // Square mark: favicon, collapsed-rail icon and hero mark all render it
      // at a small square size, so a crisp 512px source is plenty for retina.
      square: { width: 512, height: 512 },
      // Wide logo: rendered at a fixed 24px height in the sidebar, so store it
      // at 3x (72px) tall; cap the width at 468px (6.5:1, the shipped wordmark
      // ratio) to reject absurdly wide banners.
      wide: { width: 468, height: 72 }
    };

    /** Dictionaries for the `custom-logo` locale namespace. */
    const zh = {
      "panel.title": "品牌设置",
      "slot.square.title": "网页图标",
      "slot.square.hint": "正方形 1:1,建议 512×512,居中裁剪。用于浏览器标签页、折叠侧栏、欢迎区鲸鱼图标",
      "slot.wide.title": "侧边栏 Logo",
      "slot.wide.hint": "横向图,建议 6.5:1(如 468×72,纯文字)或 3:1(图标+文字)。高度固定 24px 显示,宽度按比例",
      "action.choose": "选择图片",
      "action.reset": "恢复默认",
      "state.busy": "处理中…",
      "state.uploadError": "上传失败",
      "state.noImage": "未设置"
    };
    const en = {
      "panel.title": "Branding",
      "slot.square.title": "Web icon",
      "slot.square.hint": "Square 1:1, 512×512 recommended, center-cropped. Used for tab favicon, collapsed rail and hero whale",
      "slot.wide.title": "Sidebar logo",
      "slot.wide.hint": "Wide, 6.5:1 (e.g. 468×72, text) or 3:1 (icon + text) recommended. Fixed 24px height, width proportional",
      "action.choose": "Choose image",
      "action.reset": "Reset to default",
      "state.busy": "Working…",
      "state.uploadError": "Upload failed",
      "state.noImage": "Not set"
    };

    const css = [
      ".dcl_section{box-sizing:border-box;display:flex;flex-direction:column;gap:12px;padding:8px 20px 20px;max-width:640px}",
      ".dcl_sectionFooter{display:flex;justify-content:space-between;align-items:center;gap:8px}",
      ".dcl_card{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;padding:10px;display:flex;gap:10px;align-items:center}",
      ".dcl_preview{flex:none;width:48px;height:48px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background-position:center;background-repeat:no-repeat;background-size:contain}",
      ".dcl_preview.dcl_empty{border-style:dashed}",
      ".dcl_previewWide{flex:none;width:108px;height:48px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background-position:center;background-repeat:no-repeat;background-size:contain}",
      ".dcl_previewWide.dcl_empty{border-style:dashed}",
      ".dcl_cardMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}",
      ".dcl_cardTitle{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:600;margin:0}",
      ".dcl_cardHint{color:var(--dsw-alias-label-caption);font-size:11px;line-height:15px;margin:0}",
      ".dcl_choose{cursor:pointer;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:12px;padding:5px 10px;white-space:nowrap}",
      ".dcl_choose:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-solid)}",
      ".dcl_choose:disabled{opacity:.5;cursor:default}",
      ".dcl_reset{cursor:pointer;border:none;background:0 0;color:var(--dsw-alias-label-secondary);font-family:inherit;font-size:12px;padding:4px 8px;border-radius:7px}",
      ".dcl_reset:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}",
      ".dcl_reset:disabled{opacity:.5;cursor:default}",
      ".dcl_version{color:var(--dsw-alias-label-caption);font-size:10px;line-height:14px;opacity:.7;margin:0}",
      ".dcl_error{color:#f43f5e;font-size:11px;line-height:15px;margin:0}",
      ".dcl_hidden{display:none}"
    ].join("");
    const tagId = "dsh-custom-logo/BrandPanel.module.css";
    if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
      const tag = document.createElement("style");
      tag.dataset.plugin = "dsh-custom-logo";
      tag.dataset.pluginCss = tagId;
      tag.textContent = css;
      document.head.appendChild(tag);
    }

    const S = {
      section: "dcl_section",
      sectionFooter: "dcl_sectionFooter",
      card: "dcl_card",
      preview: "dcl_preview",
      previewWide: "dcl_previewWide",
      empty: "dcl_empty",
      cardMain: "dcl_cardMain",
      cardTitle: "dcl_cardTitle",
      cardHint: "dcl_cardHint",
      choose: "dcl_choose",
      reset: "dcl_reset",
      version: "dcl_version",
      error: "dcl_error",
      hidden: "dcl_hidden"
    };

    /**
     * Normalize one picked image to the slot's target size and re-encode as
     * PNG. `square` center-crops to a square; `wide` keeps its ratio, scales
     * to 72px tall (width proportional), then caps the width at 468px.
     * @returns PNG blob ready to POST.
     */
    async function encodeSlotPng(file, slot) {
      const bitmap = await createImageBitmap(file);
      try {
        const target = SLOT_TARGET[slot];
        let sx, sy, sw, sh, width, height;
        if (slot === "square") {
          const edge = Math.min(bitmap.width, bitmap.height);
          sx = (bitmap.width - edge) / 2;
          sy = (bitmap.height - edge) / 2;
          sw = edge;
          sh = edge;
          width = target.width;
          height = target.height;
        } else {
          // Scale the whole image to 72px tall first.
          const scale = Math.min(target.height / bitmap.height, target.width / bitmap.width, 1);
          width = Math.max(1, Math.round(bitmap.width * scale));
          height = Math.max(1, Math.round(bitmap.height * scale));
          sx = 0;
          sy = 0;
          sw = bitmap.width;
          sh = bitmap.height;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx2d = canvas.getContext("2d");
        ctx2d.drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height);
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
        if (blob === null) throw new Error("png encode failed");
        return blob;
      } finally {
        bitmap.close?.();
      }
    }

    /** Upload one slot; resolves when the host half confirms the write. */
    async function uploadSlotPng(file, slot) {
      const blob = await encodeSlotPng(file, slot);
      const res = await fetch("/custom-logo/upload?slot=" + encodeURIComponent(slot), {
        method: "POST",
        headers: { "content-type": "image/png" },
        body: blob
      });
      let data = null;
      try {
        data = await res.json();
      } catch {
        /* non-JSON error body */
      }
      if (!res.ok || !data?.ok) {
        throw new Error("upload " + String(data?.error ?? res.status));
      }
    }

    /** One upload card: preview thumbnail + title/hint + file picker. */
    function UploadCard({ t, slot, state, busy, onPick }) {
      const translate = (key) => (t !== void 0 ? t(key) : key);
      const present = state !== null && state[slot] !== null;
      const url = slot === "square"
        ? "/custom-logo/logo-128.png"
        : "/custom-logo/logo-wide.png";
      const previewClass = slot === "square" ? S.preview : S.previewWide;
      const inputRef = react.useRef(null);
      const busyThis = busy === slot;
      return react_jsx_runtime.jsxs("div", {
        className: S.card,
        children: [
          react_jsx_runtime.jsx("div", {
            className: previewClass + (present ? "" : " " + S.empty),
            style: present ? { backgroundImage: `url(${url}?v=${state[slot]})` } : void 0,
            title: present ? void 0 : translate("state.noImage")
          }),
          react_jsx_runtime.jsxs("div", {
            className: S.cardMain,
            children: [
              react_jsx_runtime.jsx("p", { className: S.cardTitle, children: translate(`slot.${slot}.title`) }),
              react_jsx_runtime.jsx("p", { className: S.cardHint, children: translate(`slot.${slot}.hint`) })
            ]
          }),
          react_jsx_runtime.jsx("input", {
            ref: inputRef,
            type: "file",
            accept: "image/png,image/jpeg,image/webp",
            className: S.hidden,
            onChange: (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              onPick(slot, file ?? null);
            }
          }),
          react_jsx_runtime.jsx("button", {
            type: "button",
            className: S.choose,
            disabled: busy !== null,
            onClick: () => inputRef.current?.click(),
            children: busyThis ? translate("state.busy") : translate("action.choose")
          })
        ]
      });
    }

    /**
     * Settings dialog section: the two upload cards inline in the official
     * settings panel, plus the reset row.
     */
    function BrandSettingsSection({ t }) {
      const translate = (key) => (t !== void 0 ? t(key) : (zh[key] ?? key));
      const [state, setState] = react.useState(null);
      const [busy, setBusy] = react.useState(null);
      const [error, setError] = react.useState(null);

      const loadState = react.useCallback(async () => {
        try {
          const res = await fetch("/custom-logo/state", { cache: "no-store" });
          if (res.ok) setState(await res.json());
        } catch {
          /* preview stays on last known state */
        }
      }, []);

      react.useEffect(() => {
        loadState();
      }, [loadState]);

      const pick = async (slot, file) => {
        if (file === null) return;
        setError(null);
        setBusy(slot);
        try {
          await uploadSlotPng(file, slot);
          location.reload();
        } catch (err) {
          setError(`${translate("state.uploadError")}: ${String(err?.message ?? err)}`);
          setBusy(null);
        }
      };

      const reset = async () => {
        setError(null);
        setBusy("reset");
        try {
          const res = await fetch("/custom-logo/reset", { method: "POST" });
          if (!res.ok) throw new Error(res.status);
          location.reload();
        } catch (err) {
          setError(`${translate("state.uploadError")}: ${String(err?.message ?? err)}`);
          setBusy(null);
        }
      };

      return react_jsx_runtime.jsxs("div", {
        className: S.section,
        "data-custom-logo-settings": true,
        children: [
          react_jsx_runtime.jsx(UploadCard, { t: translate, slot: "square", state, busy, onPick: pick }),
          react_jsx_runtime.jsx(UploadCard, { t: translate, slot: "wide", state, busy, onPick: pick }),
          error !== null && react_jsx_runtime.jsx("p", { className: S.error, children: error }),
          react_jsx_runtime.jsxs("div", {
            className: S.sectionFooter,
            children: [
              react_jsx_runtime.jsx("p", { className: S.version, children: VERSION }),
              react_jsx_runtime.jsx("button", {
                type: "button",
                className: S.reset,
                disabled: busy !== null,
                onClick: reset,
                children: translate("action.reset")
              })
            ]
          })
        ]
      });
    }

    /**
     * Read the persisted branding state (per-slot mtime) once on mount. The
     * mtime is appended as a cache-busting `?v=` so an upload followed by
     * `location.reload()` is always picked up fresh.
     */
    function useLogoState() {
      const [state, setState] = react.useState(null);
      react.useEffect(() => {
        let alive = true;
        fetch("/custom-logo/state", { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : null))
          .then((s) => { if (alive) setState(s); })
          .catch(() => {});
        return () => { alive = false; };
      }, []);
      return state;
    }

    /**
     * Sidebar mark occupant. The sidebar supplies `size` (24px), matching the
     * shipped FishLogo contract. Renders the square upload at that exact edge.
     */
    function CustomMark({ size }) {
      const state = useLogoState();
      if (state === null || state.square === null) return null;
      return react_jsx_runtime.jsx("img", {
        src: `/custom-logo/logo-128.png?v=${state.square}`,
        alt: "",
        width: size,
        height: size,
        style: { width: size, height: size, display: "block", objectFit: "contain" }
      });
    }

    /**
     * Sidebar name occupant. The sidebar gives no size (the occupant owns its
     * width); render the wide upload at the fixed 24px row height with a
     * proportional width, exactly like the shipped wordmark does.
     */
    function CustomName() {
      const state = useLogoState();
      if (state === null || state.wide === null) return null;
      return react_jsx_runtime.jsx("img", {
        src: `/custom-logo/logo-wide.png?v=${state.wide}`,
        alt: "",
        style: { height: 24, width: "auto", display: "block" }
      });
    }

    /**
     * Hero mark occupant ("探索未至之境"). The conversation shell supplies
     * `size` (34px) and `className`; render the square upload at that edge.
     */
    function CustomHeroMark({ size, className }) {
      const state = useLogoState();
      if (state === null || state.square === null) return null;
      return react_jsx_runtime.jsx("img", {
        src: `/custom-logo/logo-128.png?v=${state.square}`,
        alt: "",
        width: size,
        height: size,
        className,
        style: { width: size, height: size, display: "block", objectFit: "contain" }
      });
    }

    /** Services required by the client plugin body. */
    const inject = ["slots", "locale"];

    /**
     * Client plugin body: register the dictionaries, the settings section, and
     * the three brand slot occupants (sidebar mark + name as one declaration-
     * aware set, mirroring `dsh-client-ui-brand-official`; hero mark on its
     * own).
     */
    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), "custom-logo: dictionaries");

      ctx.slots.inject("settings.section", () => ctx.slots.register({
        name: "settings.section",
        id: "custom-logo",
        order: 125,
        label: () => ctx.locale.bind(NS)("panel.title"),
        locale: NS
      }, BrandSettingsSection));

      ctx.slots.inject("sidebar.brand.mark", () => ctx.slots.inject("sidebar.brand.name", function* () {
        yield ctx.slots.register({ name: "sidebar.brand.mark" }, CustomMark);
        yield ctx.slots.register({ name: "sidebar.brand.name" }, CustomName);
      }));

      ctx.slots.inject("conversation.hero.brand.mark", function* () {
        yield ctx.slots.register({ name: "conversation.hero.brand.mark" }, CustomHeroMark);
      });
    }

    exports.apply = apply;
    exports.inject = inject;
    exports.BrandSettingsSection = BrandSettingsSection;
    exports.encodeSlotPng = encodeSlotPng;
    exports.uploadSlotPng = uploadSlotPng;
    return module.exports;
  }
});
