/**
 * dsh-custom-logo — browser half.
 *
 * Two responsibilities:
 *
 *   1. A first-level "品牌设置" section in the official settings dialog where
 *      the user picks two images. SVG uploads are kept verbatim (vector, the
 *      same crispness as the shipped marks); raster images (PNG/JPEG/WebP) are
 *      normalized to a fixed target in the browser and re-encoded as PNG.
 *
 *   2. Occupying the official brand slots (the same mechanism
 *      `@deepseek-ai/dsh-client-ui-brand-official` uses): `sidebar.brand.mark`,
 *      `sidebar.brand.name` and `conversation.hero.brand.mark` are registered
 *      with <img> components whose size is supplied by the slot owner.
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
    const VERSION = "dsh-custom-logo v1.1.1";

    /** Target output size for raster square uploads (server stores exactly this). */
    const SQUARE_TARGET = 512;
    /** Target output size for raster wide uploads: 72px tall, width ≤468px. */
    const WIDE_TARGET = { height: 72, maxWidth: 468 };

    /** Dictionaries for the `custom-logo` locale namespace. */
    const zh = {
      "panel.title": "品牌设置",
      "slot.square.title": "网页图标",
      "slot.square.hint": "SVG 矢量最佳(与官方一致、无限清晰);或 1:1 位图,建议 ≥512×512,居中裁剪。用于标签页、折叠侧栏、欢迎区鲸鱼图标",
      "slot.wide.title": "侧边栏 Logo",
      "slot.wide.hint": "SVG 矢量最佳;或横向位图,建议 6.5:1(如 468×72 纯文字)或 3:1(图标+文字)。高度固定 24px 显示",
      "action.choose": "选择图片",
      "action.reset": "恢复默认",
      "state.busy": "处理中…",
      "state.uploadError": "上传失败",
      "state.noImage": "未设置"
    };
    const en = {
      "panel.title": "Branding",
      "slot.square.title": "Web icon",
      "slot.square.hint": "SVG is best (crisp like the official marks); or a 1:1 raster ≥512×512, center-cropped. Used for tab, collapsed rail, hero whale",
      "slot.wide.title": "Sidebar logo",
      "slot.wide.hint": "SVG is best; or a wide raster, 6.5:1 (e.g. 468×72 text) or 3:1 (icon + text). Fixed 24px height",
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

    /** True when a file is an SVG by MIME type or extension. */
    function isSvg(file) {
      return file.type === "image/svg+xml" || /\.svg$/i.test(file.name);
    }

    /** Load a raster file into an <img> so a canvas can draw it (broad codec support). */
    function loadImage(file) {
      return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("could not decode image")); };
        img.src = url;
      });
    }

    /**
     * Prepare one picked file for upload.
     *
     * SVG is returned verbatim (ext "svg"). Raster images are normalized via a
     * canvas: `square` center-crops to 512×512; `wide` scales to 72px tall with
     * a 468px width cap, then re-encodes as PNG (ext "png").
     *
     * @returns { blob, ext } ready to POST.
     */
    async function prepareUpload(file, slot) {
      if (isSvg(file)) {
        return { blob: file, ext: "svg" };
      }

      const img = await loadImage(file);
      try {
        let sx, sy, sw, sh, width, height;
        if (slot === "square") {
          const edge = Math.min(img.naturalWidth, img.naturalHeight);
          sx = (img.naturalWidth - edge) / 2;
          sy = (img.naturalHeight - edge) / 2;
          sw = edge;
          sh = edge;
          width = SQUARE_TARGET;
          height = SQUARE_TARGET;
        } else {
          const scale = Math.min(WIDE_TARGET.height / img.naturalHeight, WIDE_TARGET.maxWidth / img.naturalWidth, 1);
          width = Math.max(1, Math.round(img.naturalWidth * scale));
          height = Math.max(1, Math.round(img.naturalHeight * scale));
          sx = 0;
          sy = 0;
          sw = img.naturalWidth;
          sh = img.naturalHeight;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx2d = canvas.getContext("2d");
        ctx2d.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
        if (blob === null) throw new Error("png encode failed");
        return { blob, ext: "png" };
      } finally {
        /* nothing to release for the <img> path */
      }
    }

    /** Upload one slot; resolves when the host half confirms the write. */
    async function uploadSlot(file, slot) {
      const { blob, ext } = await prepareUpload(file, slot);
      const res = await fetch("/custom-logo/upload?slot=" + encodeURIComponent(slot) + "&ext=" + ext, {
        method: "POST",
        headers: { "content-type": ext === "svg" ? "image/svg+xml" : "image/png" },
        body: blob
      });
      let data = null;
      try {
        data = await res.json();
      } catch {
        /* non-JSON error body */
      }
      if (!res.ok || !data?.ok) {
        throw new Error(String(data?.error ?? res.status));
      }
    }

    /** Resolve the preview/src URL for a slot from its persisted state. */
    function slotUrl(slotState) {
      if (slotState === null || slotState === undefined) return null;
      return `/custom-logo/${slotState.file}?v=${slotState.mtime}`;
    }

    /** One upload card: preview thumbnail + title/hint + file picker. */
    function UploadCard({ t, slot, state, busy, onPick }) {
      const translate = (key) => (t !== void 0 ? t(key) : key);
      const slotState = state !== null ? state[slot] : null;
      const present = slotState !== null && slotState !== undefined;
      const url = slotUrl(slotState);
      const previewClass = slot === "square" ? S.preview : S.previewWide;
      const inputRef = react.useRef(null);
      const busyThis = busy === slot;
      return react_jsx_runtime.jsxs("div", {
        className: S.card,
        children: [
          react_jsx_runtime.jsx("div", {
            className: previewClass + (present ? "" : " " + S.empty),
            style: present ? { backgroundImage: `url(${url})` } : void 0,
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
            accept: "image/svg+xml,image/png,image/jpeg,image/webp",
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
          await uploadSlot(file, slot);
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
     * Read the persisted branding state. Prefer the synchronous
     * `window.__DSH_CUSTOM_LOGO__` injected by the host half (so the slot
     * occupants render on first paint without a flash); otherwise fall back
     * to a fetch.
     */
    function useLogoState() {
      const [state, setState] = react.useState(() =>
        (typeof window !== "undefined" && window.__DSH_CUSTOM_LOGO__) || null
      );
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
      const url = state !== null ? slotUrl(state.square) : null;
      if (url === null) return null;
      return react_jsx_runtime.jsx("img", {
        src: url,
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
      const url = state !== null ? slotUrl(state.wide) : null;
      if (url === null) return null;
      return react_jsx_runtime.jsx("img", {
        src: url,
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
      const url = state !== null ? slotUrl(state.square) : null;
      if (url === null) return null;
      return react_jsx_runtime.jsx("img", {
        src: url,
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
     * — only when the matching logo actually exists — the brand slot
     * occupants. The slot registry has no "render fallback when the occupant
     * returns null" behavior, so the occupants are registered conditionally,
     * decided synchronously from the state the host half injected.
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

      const initial = (typeof window !== "undefined" && window.__DSH_CUSTOM_LOGO__) || null;
      const hasSquare = initial !== null && initial.square != null;
      const hasWide = initial !== null && initial.wide != null;

      if (hasSquare) {
        ctx.slots.inject("sidebar.brand.mark", function* () {
          yield ctx.slots.register({ name: "sidebar.brand.mark" }, CustomMark);
        });
      }
      if (hasWide) {
        ctx.slots.inject("sidebar.brand.name", function* () {
          yield ctx.slots.register({ name: "sidebar.brand.name" }, CustomName);
        });
      }
      if (hasSquare) {
        ctx.slots.inject("conversation.hero.brand.mark", function* () {
          yield ctx.slots.register({ name: "conversation.hero.brand.mark" }, CustomHeroMark);
        });
      }
    }

    exports.apply = apply;
    exports.inject = inject;
    exports.BrandSettingsSection = BrandSettingsSection;
    exports.prepareUpload = prepareUpload;
    exports.uploadSlot = uploadSlot;
    return module.exports;
  }
});
