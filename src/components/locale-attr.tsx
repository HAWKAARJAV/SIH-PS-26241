"use client";

import { useEffect } from "react";

export function LocaleAttr({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.script = locale === "ta" ? "tamil" : locale === "hi" || locale === "mr" ? "deva" : "latn";
    const display = locale === "ta" ? "var(--font-noto-serif-ta)" : locale === "hi" || locale === "mr" ? "var(--font-noto-serif-deva)" : "var(--font-fraunces)";
    document.documentElement.style.setProperty("--font-display-active", display);
  }, [locale]);
  return null;
}
