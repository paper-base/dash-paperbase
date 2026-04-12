import { Fragment, createElement, type ReactNode } from "react";

/**
 * Tailwind classes for numeric UI: Poppins + tabular figures via `.font-numbers`.
 * Bengali uses the primary sans stack so Bengali numerals match body text (see StatsCard).
 */
export function numberTextClass(locale: string): string {
  return locale === "bn" ? "font-sans tabular-nums" : "font-numbers";
}

/**
 * Renders `text` with ASCII digit runs in Poppins (`.font-numbers`); letters stay on the body sans.
 * Bengali locale leaves the string unchanged so numerals stay on the primary stack.
 */
export function digitsInNumberFont(text: string, locale: string): ReactNode {
  if (locale === "bn" || !/\d/.test(text)) {
    return text;
  }
  const parts = text.split(/(\d+)/);
  return parts.map((part, i) => {
    if (part === "") return null;
    if (/^\d+$/.test(part)) {
      return createElement("span", { key: i, className: "font-numbers" }, part);
    }
    return createElement(Fragment, { key: i }, part);
  });
}
