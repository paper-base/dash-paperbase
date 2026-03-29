/**
 * BD-style address: road/village + thana + district.
 * `shipping_address` stores all three comma-separated for courier-friendly full line.
 */

/** Compose stored shipping_address for API (village, thana, district). */
export function joinVillageThanaDistrict(
  village: string,
  thana: string,
  district: string,
): string {
  return [village.trim(), thana.trim(), district.trim()].filter(Boolean).join(", ");
}

/** @deprecated Use joinVillageThanaDistrict; kept for any external imports. */
export function joinVillageThana(village: string, thana: string): string {
  return [village.trim(), thana.trim()].filter(Boolean).join(", ");
}

/**
 * Parse shipping_address back into form fields.
 * 3+ comma-separated segments: first = village, last = district, middle = thana.
 * 2 segments: village, thana (district comes from order.district).
 */
export function splitShippingAddressForForm(shipping_address: string): {
  village: string;
  thana: string;
  trailingDistrict: string | null;
} {
  const parts = (shipping_address || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) return { village: "", thana: "", trailingDistrict: null };
  if (parts.length === 1) return { village: parts[0], thana: "", trailingDistrict: null };
  if (parts.length === 2) {
    return { village: parts[0], thana: parts[1], trailingDistrict: null };
  }
  const village = parts[0];
  const trailingDistrict = parts[parts.length - 1];
  const thana = parts.slice(1, -1).join(", ");
  return { village, thana, trailingDistrict };
}
