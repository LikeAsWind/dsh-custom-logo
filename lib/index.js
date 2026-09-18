/**
 * dsh-custom-logo — host half.
 *
 * Serves the uploaded logo PNGs and the favicon rewrite. The sidebar and hero
 * brand slots are occupied by the browser half (lib/client.js) through the
 * official slot system, exactly like `dsh-client-ui-brand-official`, so this
 * half no longer injects any CSS to hide the shipped SVG marks.
 *
 *   1. Serves logo PNGs from `<DSH_HOME>/branding/` over `/custom-logo/*`.
 *   2. POST /custom-logo/upload?slot=square|wide accepts a PNG (resized
 *      client-side via canvas) and writes it to the branding directory.
 *      POST /custom-logo/reset removes them. Both are loopback-only.
 *   3. Taps index.html to rewrite the tab favicon `<link>` (the one brand
 *      surface the slot system cannot reach), matching both `/favicon.svg`
 *      and `./favicon.svg`.
 *
 * @module dsh-custom-logo
 */

import { join } from "node:path";
import { homedir } from "node:os";
import { statSync } from "node:fs";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";

/** Stable Cordis plugin name. */
const name = "custom-logo";

/** Services required before this plugin activates. */
const inject = ["webServer"];

/** Absolute directory that holds the logo PNGs. */
const BRANDING_DIR = join(process.env.DSH_HOME ?? join(homedir(), ".dsh"), "branding");

/** Route prefix owned by this plugin. */
const ROUTE = "/custom-logo";

/** Upload size cap (bytes). */
const MAX_UPLOAD = 8 * 1024 * 1024;

/** PNG magic number; uploads must start with it. */
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Files written per upload slot. square serves favicon + collapsed rail. */
const SLOT_FILES = {
  square: ["logo-128.png", "logo-64.png"],
  wide: ["logo-wide.png"]
};

/** All file names servable from the branding directory. */
const ALLOWED = new Set([
  ...SLOT_FILES.square,
  ...SLOT_FILES.wide,
  "logo-32.png",
  "logo-256.png",
  "logo-512.png",
  "logo-master.png"
]);

/**
 * Read presence state straight from disk (per request, 2 stats). Files may
 * also be dropped in manually — the old pre-upload workflow — so nothing is
 * cached between requests.
 * @returns mtime (ms) per slot, or null when absent.
 */
function readStateSync() {
  const mtime = (files) => {
    for (const file of files) {
      try {
        return statSync(join(BRANDING_DIR, file)).mtimeMs;
      } catch {
        /* absent — try next */
      }
    }
    return null;
  };
  return { square: mtime(SLOT_FILES.square), wide: mtime(SLOT_FILES.wide) };
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

/** Serve one logo PNG from the branding directory. */
async function serveImage(res, file) {
  try {
    const bytes = await readFile(join(BRANDING_DIR, file));
    res.writeHead(200, { "content-type": "image/png", "cache-control": "public, max-age=3600" });
    res.end(bytes);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("missing");
  }
}

/** POST /custom-logo/upload?slot=square|wide — write PNG, refresh state. */
async function handleUpload(req, res, slot) {
  if (!Object.prototype.hasOwnProperty.call(SLOT_FILES, slot)) {
    sendJson(res, 400, { ok: false, error: "bad slot" });
    return;
  }
  const body = await readBody(req, MAX_UPLOAD);
  if (body === null) {
    sendJson(res, 413, { ok: false, error: "too large" });
    return;
  }
  if (body.length < 8 || !body.subarray(0, 8).equals(PNG_SIGNATURE)) {
    sendJson(res, 415, { ok: false, error: "not a PNG" });
    return;
  }
  await mkdir(BRANDING_DIR, { recursive: true });
  for (const file of SLOT_FILES[slot]) {
    const target = join(BRANDING_DIR, file);
    const temp = target + ".tmp";
    await writeFile(temp, body);
    await rename(temp, target);
  }
  sendJson(res, 200, { ok: true, slot });
}

/** POST /custom-logo/reset — remove managed files, keep unrelated ones. */
async function handleReset(res) {
  const files = [...SLOT_FILES.square, ...SLOT_FILES.wide];
  for (const file of files) {
    await unlink(join(BRANDING_DIR, file)).catch(() => {});
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
      await handleUpload(req, res, url.searchParams.get("slot") ?? "");
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

/** Pure index.html transform — rewrites only the tab favicon link. */
function tapIndexHtml(html) {
  const state = readStateSync();
  let out = html;
  if (state.square !== null) {
    // The shipped index.html writes the favicon href as `./favicon.svg`, but
    // older builds used `/favicon.svg`; match either so the rewrite survives
    // both (a literal string match would silently miss one of them). Replace
    // the whole <link> so the type flips to image/png alongside the href.
    out = out.replace(
      /<link rel="icon"[^>]*href=["']\.?\/favicon\.svg["'][^>]*>/,
      `<link rel="icon" type="image/png" href="/custom-logo/logo-128.png?v=${state.square}" />`
    );
  }
  return out;
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
