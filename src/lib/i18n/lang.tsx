"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

export type Lang = "en" | "bn";

const STORAGE_KEY = "ts7-lang-v1";

/* ---- module-level external store (hydration-safe, like progress.ts) ---- */

let current: Lang = "en";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Lang {
  return current;
}

function getServerSnapshot(): Lang {
  return "en";
}

let hydrated = false;

export function setLang(lang: Lang): void {
  current = lang;
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // storage unavailable — language still switches for this session
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang === "bn" ? "bn" : "en";
  }
  emit();
}

/** Hydrated language + setter. Defaults to English on the server and on the
 *  first client render; syncs with localStorage once after mount. */
export function useLang(): { lang: Lang; setLang: (l: Lang) => void } {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (hydrated) return;
    hydrated = true;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "bn" || stored === "en") {
        current = stored;
      }
    } catch {
      // ignore
    }
    if (document.documentElement.lang !== (current === "bn" ? "bn" : "en")) {
      document.documentElement.lang = current === "bn" ? "bn" : "en";
    }
    emit();
  }, []);

  const update = useCallback((l: Lang) => setLang(l), []);

  return { lang, setLang: update };
}
