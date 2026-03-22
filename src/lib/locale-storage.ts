/** Client-side preference mirror; edge uses NEXT_LOCALE cookie (next-intl). */
export const CORE_LOCALE_STORAGE_KEY = "core-locale";

export const NEXT_INTL_LOCALE_COOKIE = "NEXT_LOCALE";

export function setLocalePreferenceCookie(locale: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${NEXT_INTL_LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}
