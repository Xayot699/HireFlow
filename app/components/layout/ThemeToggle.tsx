"use client";

import { useSyncExternalStore } from "react";
import { translate, type Locale } from "@/lib/messages";

type Theme = "light" | "dark";

function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function getThemeSnapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getServerThemeSnapshot(): Theme {
  return "light";
}

export default function ThemeToggle({ locale }: { locale: Locale }) {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);

  function toggleTheme() {
    const nextTheme: Theme = getThemeSnapshot() === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    document.cookie = `hireflow-theme=${nextTheme}; Path=/; Max-Age=31536000; SameSite=Lax`;
    try {
      window.localStorage.setItem("hireflow-theme", nextTheme);
    } catch {
      // The theme still applies for this session without persistent storage.
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={translate(locale, theme === "light" ? "switchDark" : "switchLight")}
      aria-pressed={theme === "dark"}
      title={translate(locale, theme === "light" ? "switchDark" : "switchLight")}
      className="theme-toggle grid size-10 shrink-0 place-items-center rounded-full border border-[#17231d]/15 text-base text-[#315a42] transition hover:bg-[#e8ecdf] focus-visible:outline-offset-2"
    >
      <span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span>
    </button>
  );
}
