import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

/** Shared with the inline no-flash script in __root.tsx. Keep them in step. */
export const THEME_STORAGE_KEY = "sgv-theme";

/**
 * Runs before first paint, inlined into <head>.
 *
 * Without this, a visitor who chose dark mode gets a white flash on every page
 * load: React only applies the class after hydration, which is several hundred
 * milliseconds too late. Written as a string because it has to be a synchronous
 * blocking script, not a module.
 *
 * Wrapped in try/catch because reading localStorage throws outright in a
 * cross-origin iframe or with site data blocked, and a theme preference is not
 * worth taking the whole page down for.
 */
export const themeScript = `(function(){try{var k="${THEME_STORAGE_KEY}";var s=localStorage.getItem(k);var d=s==="dark"||(!s&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

function systemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

/**
 * The current theme, and a toggle.
 *
 * Initial state is "light" on both server and first client render so hydration
 * matches; the effect below then reconciles with what the inline script already
 * put on <html>. That means the toggle's own icon can be one frame behind the
 * page, which is invisible, whereas a hydration mismatch is not.
 */
export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  // Follow the OS while the visitor has expressed no preference of their own.
  useEffect(() => {
    const query = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!query) return;

    const onChange = (event: MediaQueryListEvent) => {
      if (storedTheme()) return;
      const next: Theme = event.matches ? "dark" : "light";
      setTheme(next);
      document.documentElement.classList.toggle("dark", next === "dark");
      document.documentElement.style.colorScheme = next;
    };

    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      document.documentElement.style.colorScheme = next;
      try {
        // Once they choose, stop following the OS: an explicit choice outranks a
        // system default, including when the system flips at sunset.
        if (next === systemTheme()) localStorage.removeItem(THEME_STORAGE_KEY);
        else localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Private mode or blocked storage: the toggle still works for this visit.
      }
      return next;
    });
  }, []);

  return { theme, toggle };
}
