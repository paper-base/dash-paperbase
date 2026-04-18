export type InventoryStatusLevel = "red" | "orange" | "none";

/** Default when deriving status from flat product `stock` fields (not per-SKU thresholds). */
export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export function normalizeStockValue(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

/**
 * Single-pass status from a product list (`stock` = sellable quantity).
 * Red wins over orange. Empty list → none.
 */
export function deriveInventoryStatusFromProducts(
  products: ReadonlyArray<{ stock?: unknown }>,
  lowStockThreshold: number = DEFAULT_LOW_STOCK_THRESHOLD
): InventoryStatusLevel {
  if (!products.length) return "none";
  const threshold = Math.max(0, Math.floor(lowStockThreshold));
  let hasOut = false;
  let hasLow = false;
  for (let i = 0; i < products.length; i++) {
    const qty = normalizeStockValue(products[i]?.stock);
    if (qty === 0) {
      hasOut = true;
      break;
    }
    if (qty > 0 && qty <= threshold) hasLow = true;
  }
  if (hasOut) return "red";
  if (hasLow) return "orange";
  return "none";
}

export function inventoryStatusFromCounts(
  outOfStockCount: number,
  lowInStockCount: number
): InventoryStatusLevel {
  if (outOfStockCount > 0) return "red";
  if (lowInStockCount > 0) return "orange";
  return "none";
}
