"use client";

import { useEffect } from "react";

function cookieValue(name: string): string | undefined {
  const prefix = `${name}=`;
  const entry = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : undefined;
}

export default function PreferencesBootstrap() {
  useEffect(() => {
    let savedLocale: string | null = null;
    let savedTheme: string | null = null;
    try {
      savedLocale = window.localStorage.getItem("hireflow-locale");
      savedTheme = window.localStorage.getItem("hireflow-theme");
    } catch {
      // Fall back to the non-HttpOnly preference cookies.
    }

    const locale = savedLocale ?? cookieValue("hireflow-locale");
    const theme = savedTheme ?? cookieValue("hireflow-theme");
    if (locale === "uz" || locale === "en" || locale === "ru") {
      document.documentElement.lang = locale;
    }
    if (theme === "light" || theme === "dark") {
      document.documentElement.dataset.theme = theme;
    }
  }, []);

  return null;
}
