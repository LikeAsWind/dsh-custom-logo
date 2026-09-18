/**
 * dsh-custom-logo — host half.
 *
 * Serves the uploaded logo files and rewrites the tab favicon. The sidebar
 * and hero brand slots are occupied by the browser half (lib/client.js)
 * through the official slot system, exactly like
 * `@deepseek-ai/dsh-client-ui-brand-official`.
 *
 * Uploads keep their original format: SVG is stored verbatim (vector, same
 * crispness as the shipped marks), while PNG/JPEG/WebP are re-encoded to PNG
 * by the browser half. Stored files:
 *
 *   square → <DSH_HOME>/branding/logo-mark.svg | logo-mark.png
 *   wide   → <DSH_HOME>/branding/logo-wide.svg | logo-wide.png
 *
 * @module dsh-custom-logo
 */

import { join, extname } from "node:path";
import { homedir } from "node:os";
import { statSync } from "node:fs";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";

/** Stable Cordis plugin name. */
const name = "custom-logo";

/** Services required before this plugin activates. */
const inject = ["webServer"];

/** Absolute directory that holds the logo files. */
const BRANDING_DIR = join(process.env.DSH_HOME ?? join(homedir(), ".dsh"), "branding");

/** Route prefix owned by this plugin. */
const ROUTE = "/custom-logo";

/** Upload size cap (bytes). */
const MAX_UPLOAD = 8 * 1024 * 1024;

/**
 * Files written per upload slot, keyed by the two accepted formats. Uploading
 * one format removes the other for the same slot, so exactly one file exists
 * per slot at a time.
 */
const SLOT_FILES = {
  square: { svg: "logo-mark.svg", png: "logo-mark.png" },
  wide: { svg: "logo-wide.svg", png: "logo-wide.png" }
};

/** Every managed file name (plus legacy names kept for manual drops). */
const ALLOWED = new Set([
  "logo-mark.svg",
  "logo-mark.png",
  "logo-wide.svg",
  "logo-wide.png",
  // Legacy names from the pre-slot version, still readable if dropped in by hand.
  "logo-32.png",
  "logo-64.png",
  "logo-128.png",
  "logo-256.png",
  "logo-512.png",
  "logo-master.png"
]);

/**
 * Read presence state straight from disk (per request). For each slot, the
 * first file that exists wins. Returns the resolved file name and its mtime so
 * the browser half can build the URL directly.
 */
function readStateSync() {
  const slotState = (slot) => {
    for (const file of Object.values(SLOT_FILES[slot])) {
      try {
        const mtime = statSync(join(BRANDING_DIR, file)).mtimeMs;
        return { file, mtime };
      } catch {
        /* absent — try next */
      }
    }
    return null;
  };
  return { square: slotState("square"), wide: slotState("wide") };
}

/** True when the peer socket address is a loopback interface. */
function isLoopbackAddress(address) {
  const value = String(address ?? "").toLowerCase();
  return value === "127.0.0.1" || value === "::1" || value === "::ffff:127.0.0.1";
}

/** 403 unless the request originates from this machine. */
function isLocalRequest(req) {
  if (!isLoopbackAddress(req.socket?.remoteAddress)) return false;
  const host = String(req.headers.host ?? "").split(":")[0];
  return host === "" || host === "localhost" || isLoopbackAddress(host);
}

/** Read the whole request body; resolves null when it exceeds the cap. */
function readBody(req, cap) {
  return new Promise((resolve) => {
    const declared = Number(req.headers["content-length"] ?? 0);
    if (declared > cap) {
      resolve(null);
      return;
    }
    const chunks = [];
    let total = 0;
    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > cap) {
        req.destroy();
        resolve(null);
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", () => resolve(null));
  });
}

/** JSON response helper. */
function sendJson(res, status, payload) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(JSON.stringify(payload));
}

/** Minimal shape validation for an uploaded SVG (defense against junk). */
function looksLikeSvg(bytes) {
  const head = bytes.subarray(0, 512).toString("utf8").toLowerCase();
  return head.includes("<svg");
}

/** Minimal PNG signature check. */
function looksLikePng(bytes) {
  const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return bytes.length >= 8 && bytes.subarray(0, 8).equals(PNG_SIGNATURE);
}

/**
 * Serve one logo file. The Content-Type follows the extension. SVG responses
 * carry a CSP that disables scripting, so an uploaded SVG never executes code
 * when opened directly (as an <img>/<link> it is already script-inert).
 */
async function serveImage(res, file) {
  try {
    const bytes = await readFile(join(BRANDING_DIR, file));
    const isSvg = extname(file).toLowerCase() === ".svg";
    const headers = isSvg
      ? {
          "content-type": "image/svg+xml; charset=utf-8",
          "cache-control": "public, max-age=3600",
          "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'"
        }
      : {
          "content-type": "image/png",
          "cache-control": "public, max-age=3600"
        };
    res.writeHead(200, headers);
    res.end(bytes);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("missing");
  }
}

/**
 * POST /custom-logo/upload?slot=square|wide&ext=svg|png — write the file,
 * removing the same slot's other-format file first.
 */
async function handleUpload(req, res, slot, ext) {
  const slotFiles = SLOT_FILES[slot];
  if (slotFiles === undefined) {
    sendJson(res, 400, { ok: false, error: "bad slot" });
    return;
  }
  if (ext !== "svg" && ext !== "png") {
    sendJson(res, 400, { ok: false, error: "bad ext" });
    return;
  }
  const body = await readBody(req, MAX_UPLOAD);
  if (body === null) {
    sendJson(res, 413, { ok: false, error: "too large" });
    return;
  }
  if (ext === "svg") {
    if (!looksLikeSvg(body)) {
      sendJson(res, 415, { ok: false, error: "not an SVG" });
      return;
    }
  } else if (!looksLikePng(body)) {
    sendJson(res, 415, { ok: false, error: "not a PNG" });
    return;
  }

  await mkdir(BRANDING_DIR, { recursive: true });

  // Remove every file this slot could hold, so switching formats never leaves
  // a stale sibling behind.
  for (const other of Object.values(slotFiles)) {
    await unlink(join(BRANDING_DIR, other)).catch(() => {});
  }

  const target = join(BRANDING_DIR, slotFiles[ext]);
  const temp = target + ".tmp";
  await writeFile(temp, body);
  await rename(temp, target);
  sendJson(res, 200, { ok: true, slot });
}

/** POST /custom-logo/reset — remove managed files, keep unrelated ones. */
async function handleReset(res) {
  for (const slot of Object.values(SLOT_FILES)) {
    for (const file of Object.values(slot)) {
      await unlink(join(BRANDING_DIR, file)).catch(() => {});
    }
  }
  sendJson(res, 200, { ok: true });
}

/** Prefix-route dispatcher. */
async function handle(ctx, req, res) {
  const url = new URL(req.url ?? "/", "http://x");
  const tail = url.pathname.slice(ROUTE.length);
  if (req.method === "GET" && tail === "/state") {
    sendJson(res, 200, readStateSync());
    return;
  }
  if (req.method === "POST" && (tail === "/upload" || tail === "/reset")) {
    if (!isLocalRequest(req)) {
      sendJson(res, 403, { ok: false, error: "local only" });
      return;
    }
    if (tail === "/upload") {
      await handleUpload(req, res, url.searchParams.get("slot") ?? "", url.searchParams.get("ext") ?? "");
    } else {
      await handleReset(res);
    }
    return;
  }
  if (req.method === "GET") {
    const file = tail.replace(/^\//, "");
    if (ALLOWED.has(file)) {
      await serveImage(res, file);
      return;
    }
  }
  res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  res.end("not found");
}

/** Build the favicon <link> for the current square mark (svg or png). */
function faviconLink(state) {
  if (state.square === null) return null;
  const { file, mtime } = state.square;
  const type = file.endsWith(".svg") ? "image/svg+xml" : "image/png";
  return `<link rel="icon" type="${type}" href="/custom-logo/${file}?v=${mtime}" />`;
}

/** Pure index.html transform — rewrite the tab favicon and inject the state. */
function tapIndexHtml(html) {
  const state = readStateSync();
  let out = html;
  const link = faviconLink(state);
  if (link !== null) {
    // The shipped index.html writes the favicon href as `./favicon.svg`, but
    // older builds used `/favicon.svg`; match either. Replace the whole <link>
    // so the type follows the uploaded format (svg or png).
    out = out.replace(
      /<link rel="icon"[^>]*href=["']\.?\/favicon\.svg["'][^>]*>/,
      link
    );
  }
  // Tell the browser half which logos exist, synchronously, so it only
  // occupies a brand slot when the matching logo is present.
  const flag = `<script>window.__DSH_CUSTOM_LOGO__=${JSON.stringify(state)}</script>`;
  return out.replace("</head>", flag + "</head>");
}

/** Plugin entry. */
function apply(ctx) {
  ctx.effect(() => ctx.webServer.register({
    kind: "prefix",
    path: ROUTE,
    handler: (req, res) => handle(ctx, req, res)
  }), "custom-logo: /custom-logo route");

  ctx.effect(() => ctx.webServer.tapIndex((html) => tapIndexHtml(html)), "custom-logo: index tap");
}

export { apply, inject, name };
