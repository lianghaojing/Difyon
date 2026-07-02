"use client";

import {
  authLocales,
  resolveAuthLocale,
  type AuthLocale,
} from "@/lib/i18n/auth";

const AUTH_LOCALE_STORAGE_KEY = "difyon.auth.locale";

export function getInitialAuthLocale(): AuthLocale {
  if (typeof window === "undefined") return "en";

  const storedLocale = window.localStorage.getItem(AUTH_LOCALE_STORAGE_KEY);
  if (authLocales.includes(storedLocale as AuthLocale)) {
    return storedLocale as AuthLocale;
  }

  return resolveAuthLocale(window.navigator.language);
}

export function persistAuthLocale(locale: AuthLocale) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_LOCALE_STORAGE_KEY, locale);
}
