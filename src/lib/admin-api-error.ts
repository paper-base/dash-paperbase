/**
 * Normalize DRF error payloads (detail string/array, per-field errors) for display.
 */
export function formatAdminApiError(data: unknown, fallback: string): string {
  if (data == null) return fallback;
  if (typeof data === "string") return data;
  if (typeof data !== "object") return fallback;
  const o = data as Record<string, unknown>;

  const detail = o.detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const parts = detail.map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "string" in item) {
        const s = (item as { string?: unknown }).string;
        return typeof s === "string" ? s : String(item);
      }
      return String(item);
    });
    const joined = parts.filter(Boolean).join(" ");
    if (joined) return joined;
  }

  const fieldParts: string[] = [];
  for (const [key, val] of Object.entries(o)) {
    if (key === "detail") continue;
    if (Array.isArray(val) && val.length > 0) {
      const first = val[0];
      if (typeof first === "string") {
        fieldParts.push(`${key}: ${first}`);
      }
    } else if (typeof val === "string" && val.trim()) {
      fieldParts.push(`${key}: ${val}`);
    }
  }
  if (fieldParts.length > 0) return fieldParts.join(" · ");

  return fallback;
}

export function formatAdminApiErrorFromAxios(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: unknown } })?.response?.data;
  return formatAdminApiError(data, fallback);
}
