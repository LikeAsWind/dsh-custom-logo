/**
 * dsh-custom-logo — browser half.
 *
 * Hand-written `__ModuleLoader__` bundle (no build step): a first-level
 * section in the official settings dialog where the user picks two images —
 * a square icon (tab favicon + collapsed rail) and a wide logo (expanded
 * sidebar top). Images are resized to standard PNGs in the browser via
 * canvas (zero server-side image dependencies) and POSTed to the host half,
 * which writes them to <DSH_HOME>/branding/ and re-taps index.html so a
 * plain reload applies the new branding.
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
    const VERSION = "dsh-custom-logo v1.0.2";

    /** Dictionaries for the `custom-logo` locale namespace. */
    const zh = {
      "panel.title": "品牌设置",
      "slot.square.title": "网页图标",
      "slot.square.hint": "方形 · 标签页图标与折叠侧栏",
      "slot.wide.title": "侧边栏 Logo",
      "slot.wide.hint": "横向约 3:1 · 展开侧栏顶部",
      "action.choose": "选择图片",
      "action.reset": "恢复默认",
      "state.busy": "处理中…",
      "state.uploadError": "上传失败",
      "state.noImage": "未设置"
    };
    const en = {
      "panel.title": "Branding",
      "slot.square.title": "Web icon",
      "slot.square.hint": "Square · tab favicon & collapsed rail",
      "slot.wide.title": "Sidebar logo",
      "slot.wide.hint": "Wide ~3:1 · expanded sidebar top",
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
     * Decode one picked image file and re-encode it as a standard-size PNG.
     * square → 256×256 center-crop; wide → same ratio, ≤1080×126.
     * @returns PNG blob ready to POST.
     */
    async function encodeSlotPng(file, slot) {
      const bitmap = await createImageBitmap(file);
      try {
        let width, height, sx, sy, edge;
        if (slot === "square") {
          width = 256;
          height = 256;
          edge = Math.min(bitmap.width, bitmap.height);
          sx = (bitmap.width - edge) / 2;
          sy = (bitmap.height - edge) / 2;
        } else {
          const scale = Math.min(1080 / bitmap.width, 126 / bitmap.height, 1);
          width = Math.max(1, Math.round(bitmap.width * scale));
          height = Math.max(1, Math.round(bitmap.height * scale));
          edge = bitmap.width;
          sx = 0;
          sy = 0;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx2d = canvas.getContext("2d");
        if (slot === "square") {
          ctx2d.drawImage(bitmap, sx, sy, edge, edge, 0, 0, width, height);
        } else {
          ctx2d.drawImage(bitmap, 0, 0, width, height);
        }
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
     * @param props - `{ t, close }` supplied by the settings section host.
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

    /** Services required by the client plugin body. */
    const inject = ["slots", "locale"];

    /**
     * Client plugin body: register the dictionaries and the settings dialog
     * section (a first-level nav row in the official settings dialog).
     * @param ctx - client root context.
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
    }

    exports.apply = apply;
    exports.inject = inject;
    exports.BrandSettingsSection = BrandSettingsSection;
    exports.encodeSlotPng = encodeSlotPng;
    exports.uploadSlotPng = uploadSlotPng;
    return module.exports;
  }
});
