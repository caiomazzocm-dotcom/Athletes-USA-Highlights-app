/* AUSA Video Hub — offline mode.
   Keeps a copy of the app (this folder's files and the libraries it loads from
   the internet) so it opens and works without a connection.

   - The page itself (index.html): internet first, so new versions arrive as soon
     as they're pushed; the saved copy is used only when there is no connection.
   - Brand files, icons, music: saved copy first, refreshed in the background.
     Videos and songs ask for pieces ("Range" requests) — those are cut from the
     saved copy so they play and seek offline.
   - Libraries (React, Firebase, fonts): fixed version numbers, so the saved copy
     is always right.
   - Firebase Storage pictures: internet first, saved copy offline (the Studio's
     "Save offline" button puts them there). Videos are not touched here.
   Bump VERSION when brand files are replaced under the same name. */
const VERSION = "v1";
const APP = "ausa-app-" + VERSION;
const LIBS = "ausa-libs-v1";
const MEDIA = "ausa-media-v1";

const APP_FILES = [
  "./", "index.html", "manifest.json",
  "icon-192.png", "icon-512.png", "apple-touch-icon.png",
  "brand/outro.mp4", "brand/intro-audio.m4a",
  "brand/music/afro-beat.m4a", "brand/music/afro-house-mastery.m4a",
  "brand/music/afro-house.m4a", "brand/music/hip-hop-upbeat.m4a",
  "brand/music/happy-advertising-hip-hop.m4a",
];
const LIB_FILES = [
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.9/babel.min.js",
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js",
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage-compat.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
];
const LIB_HOSTS = ["cdnjs.cloudflare.com", "www.gstatic.com", "fonts.googleapis.com", "fonts.gstatic.com"];
const MEDIA_HOSTS = ["firebasestorage.googleapis.com"];

/* One file failing (a song renamed, a slow CDN) must not stop the rest. */
const saveAll = async (cacheName, urls) => {
  const cache = await caches.open(cacheName);
  await Promise.all(urls.map(async u => {
    try {
      const r = await fetch(u, { cache: "reload" });
      if (r.ok) await cache.put(u, r);
    } catch (e) {}
  }));
};

self.addEventListener("install", e => {
  e.waitUntil(Promise.all([saveAll(APP, APP_FILES), saveAll(LIBS, LIB_FILES)]).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keep = [APP, LIBS, MEDIA];
    for (const k of await caches.keys()) if (k.startsWith("ausa-") && !keep.includes(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

/* Answer "bytes=a-b" from a whole saved file, the way a web server would. */
const rangeFrom = async (full, rangeHeader) => {
  const buf = await full.arrayBuffer();
  const size = buf.byteLength;
  const m = /bytes=(\d*)-(\d*)/.exec(rangeHeader || "");
  let start = 0, end = size - 1;
  if (m) {
    if (m[1] === "" && m[2] !== "") { start = Math.max(0, size - Number(m[2])); }
    else { start = Number(m[1] || 0); if (m[2] !== "") end = Math.min(size - 1, Number(m[2])); }
  }
  if (start >= size) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      "Content-Type": full.headers.get("Content-Type") || "application/octet-stream",
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Content-Length": String(end - start + 1),
      "Accept-Ranges": "bytes",
    },
  });
};

const pageFirst = async req => {
  try {
    const r = await fetch(req);
    if (r.ok) { const c = await caches.open(APP); c.put("index.html", r.clone()); }
    return r;
  } catch (e) {
    return (await caches.match("index.html", { cacheName: APP })) || (await caches.match("./", { cacheName: APP })) || Response.error();
  }
};

const appFile = async (e, req) => {
  const cache = await caches.open(APP);
  const key = req.url.split("#")[0];
  const saved = await cache.match(key, { ignoreSearch: true });
  const range = req.headers.get("range");
  if (range) {
    if (saved) return rangeFrom(saved, range);
    /* not saved yet: play it from the internet, and save the whole file for next time */
    e.waitUntil(fetch(key).then(r => r.ok && cache.put(key, r)).catch(() => {}));
    return fetch(req);
  }
  const fresh = fetch(req).then(r => { if (r.ok && r.status === 200) cache.put(key, r.clone()); return r; });
  if (saved) { e.waitUntil(fresh.catch(() => {})); return saved; }
  return fresh;
};

const libFile = async req => {
  const cache = await caches.open(LIBS);
  const saved = await cache.match(req.url);
  if (saved) return saved;
  const r = await fetch(req);
  if (r.ok || r.type === "opaque") cache.put(req.url, r.clone());
  return r;
};

const mediaFile = async req => {
  try { return await fetch(req); }
  catch (err) {
    const saved = await caches.match(req.url, { cacheName: MEDIA });
    if (saved) return saved;
    throw err;
  }
};

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (req.mode === "navigate" || /\/(index\.html)?$/.test(url.pathname)) return e.respondWith(pageFirst(req));
    if (url.pathname.endsWith("/sw.js")) return;
    return e.respondWith(appFile(e, req));
  }
  if (LIB_HOSTS.includes(url.hostname)) return e.respondWith(libFile(req));
  /* only pictures: videos saved offline play from the browser's video store, and
     big video downloads are left to the browser untouched */
  if (MEDIA_HOSTS.includes(url.hostname) && req.destination === "image") return e.respondWith(mediaFile(req));
  /* everything else (Firestore, uploads) is left alone */
});
