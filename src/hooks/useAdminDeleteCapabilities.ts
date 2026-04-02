"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  canUserDeleteProducts,
  type MeForProductDeletePermission,
} from "@/lib/product-delete-permission";

/**
 * Mirrors admin API rules for destructive actions (products, orders, trash):
 * store OWNER/ADMIN or platform superuser.
 */
export function useAdminDeleteCapabilities() {
  const [canDelete, setCanDelete] = useState(false);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get<MeForProductDeletePermission>("auth/me/")
      .then(({ data }) => {
        if (!active) return;
        setCanDelete(canUserDeleteProducts(data));
        setIsSuperuser(Boolean(data.is_superuser));
      })
      .catch(() => {
        if (!active) return;
        setCanDelete(false);
        setIsSuperuser(false);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { canDelete, isSuperuser, loading };
}
