const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

export function toLocaleDigits(value: string, locale: string): string {
  if (locale !== "bn") return value;
  return value.replace(/\d/g, (d) => BN_DIGITS[Number(d)] ?? d);
}

export function formatCountLocalized(
  n: number,
  locale: string,
  formatBase: (x: number) => string
): string {
  return toLocaleDigits(formatBase(n), locale);
}
