/**
 * dsh-custom-logo — browser half.
 *
 * Hand-written `__ModuleLoader__` bundle (no build step): a sidebar footer
 * action that opens a small panel where the user picks two images — a square
 * icon (tab favicon + collapsed rail) and a wide logo (expanded sidebar
 * top). Images are resized to standard PNGs in the browser via canvas
 * (zero server-side image dependencies) and POSTed to the host half, which
 * writes them to <DSH_HOME>/branding/ and re-taps index.html so a plain
 * reload applies the new branding.
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
    let primitives = require("@deepseek-ai/dsh-client-ui-primitives");

    const NS = "custom-logo";
    const VERSION = "dsh-custom-logo v1.0.0";

    /** Dictionaries for the `custom-logo` locale namespace. */
    const zh = {
      "panel.title": "品牌设置",
      "panel.badge": "品牌",
      "slot.square.title": "网页图标",
      "slot.square.hint": "方形 · 标签页图标与折叠侧栏",
      "slot.wide.title": "侧边栏 Logo",
      "slot.wide.hint": "横向约 3:1 · 展开侧栏顶部",
      "action.choose": "选择图片",
      "action.reset": "恢复默认",
      "action.close": "关闭",
      "state.busy": "处理中…",
      "state.uploadError": "上传失败",
      "state.noImage": "未设置"
    };
    const en = {
      "panel.title": "Branding",
      "panel.badge": "Brand",
      "slot.square.title": "Web icon",
      "slot.square.hint": "Square · tab favicon & collapsed rail",
      "slot.wide.title": "Sidebar logo",
      "slot.wide.hint": "Wide ~3:1 · expanded sidebar top",
      "action.choose": "Choose image",
      "action.reset": "Reset to default",
      "action.close": "Close",
      "state.busy": "Working…",
      "state.uploadError": "Upload failed",
      "state.noImage": "Not set"
    };

    const css = [
      ".dcl_layer{flex:none;align-items:center;width:100%;height:49px;margin:8px 0 0;display:flex;position:relative}",
      ".dcl_layer.dcl_rail{width:36px;height:36px;margin:0}",
      ".dcl_badge{width:100%;height:49px;color:var(--dsw-alias-label-primary);cursor:pointer;background:0 0;border:none;border-radius:12px;align-items:center;gap:8px;padding:0 8px 0 6px;font-family:inherit;font-size:14px;display:inline-flex;overflow:hidden}",
      ".dcl_badge:hover{background:var(--dsw-alias-interactive-bg-hover-solid)}",
      ".dcl_layer.dcl_rail .dcl_badge{border-radius:50%;justify-content:center;gap:0;width:36px;height:36px;padding:0}",
      ".dcl_badgeLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}",
      ".dcl_panel{z-index:30;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);width:380px;max-width:calc(100vw - 24px);max-height:76vh;box-shadow:var(--dsw-shadow-lv2);border-radius:14px;flex-direction:column;display:flex;position:fixed;bottom:128px;left:12px;overflow:hidden}",
      ".dcl_header{box-sizing:border-box;border-bottom:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);flex:none;justify-content:space-between;align-items:center;min-height:46px;padding:10px 12px;display:flex}",
      ".dcl_title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:600;margin:0}",
      ".dcl_iconButton{cursor:pointer;width:26px;height:26px;color:var(--dsw-alias-label-tertiary);background:0 0;border:none;border-radius:7px;justify-content:center;align-items:center;padding:0;display:inline-flex}",
      ".dcl_iconButton:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover-solid)}",
      ".dcl_body{box-sizing:border-box;padding:12px;display:flex;flex-direction:column;gap:10px;overflow:auto}",
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
      ".dcl_footer{box-sizing:border-box;border-top:1px solid var(--dsw-alias-border-l2);padding:10px 12px;display:flex;justify-content:space-between;align-items:center;gap:8px}",
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
      layer: "dcl_layer",
      rail: "dcl_rail",
      badge: "dcl_badge",
      badgeLabel: "dcl_badgeLabel",
      panel: "dcl_panel",
      header: "dcl_header",
      title: "dcl_title",
      iconButton: "dcl_iconButton",
      body: "dcl_body",
      card: "dcl_card",
      preview: "dcl_preview",
      previewWide: "dcl_previewWide",
      empty: "dcl_empty",
      cardMain: "dcl_cardMain",
      cardTitle: "dcl_cardTitle",
      cardHint: "dcl_cardHint",
      choose: "dcl_choose",
      footer: "dcl_footer",
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
     * Sidebar footer action: badge + floating upload panel.
     * @param props - `{ wide, t }` supplied by the slot host.
     */
    function BrandPanel({ wide, t }) {
      const translate = (key) => (t !== void 0 ? t(key) : key);
      const [open, setOpen] = react.useState(false);
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
        className: wide ? S.layer : `${S.layer} ${S.rail}`,
        children: [
          open && react_jsx_runtime.jsxs("section", {
            className: S.panel,
            "data-custom-logo-panel": true,
            "aria-label": translate("panel.title"),
            children: [
              react_jsx_runtime.jsxs("header", {
                className: S.header,
                children: [
                  react_jsx_runtime.jsx("h2", { className: S.title, children: translate("panel.title") }),
                  react_jsx_runtime.jsx("button", {
                    type: "button",
                    className: S.iconButton,
                    "aria-label": translate("action.close"),
                    onClick: () => setOpen(false),
                    children: react_jsx_runtime.jsx(primitives.IconCloseOutline16, { size: 14 })
                  })
                ]
              }),
              react_jsx_runtime.jsxs("div", {
                className: S.body,
                children: [
                  react_jsx_runtime.jsx(UploadCard, { t, slot: "square", state, busy, onPick: pick }),
                  react_jsx_runtime.jsx(UploadCard, { t, slot: "wide", state, busy, onPick: pick }),
                  error !== null && react_jsx_runtime.jsx("p", { className: S.error, children: error })
                ]
              }),
              react_jsx_runtime.jsxs("div", {
                className: S.footer,
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
          }),
          react_jsx_runtime.jsxs("button", {
            type: "button",
            className: S.badge,
            "data-custom-logo-badge": true,
            "aria-label": translate("panel.badge"),
            "aria-expanded": open,
            onClick: () => setOpen((value) => !value),
            children: [
              react_jsx_runtime.jsx(primitives.IconSparkle16, { size: wide ? 14 : 18 }),
              wide && react_jsx_runtime.jsx("span", { className: S.badgeLabel, children: translate("panel.badge") })
            ]
          })
        ]
      });
    }

    /** Services required by the client plugin body. */
    const inject = ["slots", "locale"];

    /**
     * Client plugin body: register the dictionaries and the sidebar footer action.
     * @param ctx - client root context.
     */
    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), "custom-logo: dictionaries");
      ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
        name: "sidebar.footer.action",
        id: "custom-logo",
        locale: NS,
        order: 20
      }, BrandPanel));
    }

    exports.apply = apply;
    exports.inject = inject;
    exports.BrandPanel = BrandPanel;
    exports.encodeSlotPng = encodeSlotPng;
    exports.uploadSlotPng = uploadSlotPng;
    return module.exports;
  }
});
