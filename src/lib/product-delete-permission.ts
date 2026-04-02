/**
 * Mirrors admin API: DELETE /admin/products/ is allowed for platform superusers
 * and store OWNER / ADMIN for the active store (not STAFF).
 *
 * auth/me/ returns `role` as Django's get_role_display() (e.g. "Owner", "Admin").
 */
export type MeForProductDeletePermission = {
  is_superuser?: boolean;
  active_store_public_id?: string | null;
  stores?: Array<{ public_id: string; role: string }>;
};

const DELETE_PRODUCT_ROLES = new Set(["owner", "admin"]);

export function canUserDeleteProducts(me: MeForProductDeletePermission): boolean {
  if (me.is_superuser) return true;
  const active = me.active_store_public_id;
  const stores = me.stores;
  if (!active || !stores?.length) return false;
  const row = stores.find((s) => s.public_id === active);
  if (!row?.role) return false;
  const normalized = row.role.trim().toLowerCase();
  return DELETE_PRODUCT_ROLES.has(normalized);
}
