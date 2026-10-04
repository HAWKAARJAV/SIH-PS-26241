import { mkdirSync, writeFileSync } from "fs";

const source = `const CACHE = "nourish-shell-v2";
const CORE = ["/en", "/en/offline", "/en/plan", "/en/explore", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.pathname.startsWith("/api/")) return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => undefined);
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match("/en/offline"))),
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag !== "nourish-callback") return;
  event.waitUntil(
    caches.open("nourish-queue-v1").then(async (cache) => {
      const hit = await cache.match("callback-queue");
      if (!hit) return;
      const body = await hit.json();
      await fetch("/api/v1/callback", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).catch(() => undefined);
      await cache.delete("callback-queue");
    }),
  );
});
`;

mkdirSync("public", { recursive: true });
writeFileSync("public/sw.js", source);
console.warn("wrote public/sw.js");
