"use client";

import { BRAND } from "@/config/brand";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const tabs = [
  { href: "/", key: "home" },
  { href: "/room", key: "room" },
  { href: "/explore", key: "explore" },
  { href: "/plan", key: "plan" },
  { href: "/help", key: "help" },
] as const;

export function FamilyShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const pathname = usePathname();
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);
  return (
    <div className="mx-auto min-h-dvh max-w-[1200px] pb-28">
      <div className="paper-grain fixed inset-0" aria-hidden />
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur-sm">
        <Link href="/" className="font-display text-2xl text-primary">{BRAND.name}</Link>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-warning">{t("common.demo")}</span>
          <Link href="/talk" className="min-h-12 rounded-full bg-info px-4 py-2 text-sm font-semibold text-white">{t("common.talk")}</Link>
        </div>
      </header>
      {offline ? <p className="bg-warning-soft px-4 py-3 text-warning" role="status">{t("common.offline")}</p> : null}
      <main className="px-4 py-6">{children}</main>
      <footer className="px-4 pb-4 text-sm text-muted">{t("footer.disclaimer")}</footer>
      <nav className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]" aria-label="Primary">
        <ul className="mx-auto grid max-w-[1200px] grid-cols-5">
          {tabs.map((tab) => {
            const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
            return (
              <li key={tab.key}>
                <Link href={tab.href} className={`flex min-h-14 items-center justify-center text-center text-sm font-semibold ${active ? "text-primary" : "text-muted"}`}>
                  {t(`nav.${tab.key}`)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
