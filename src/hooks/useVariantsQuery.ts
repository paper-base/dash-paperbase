"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  PaginatedResponse,
  Product,
  ProductAttributeAdmin,
  ProductVariant,
} from "@/types";
import { cursorFromLink } from "@/lib/cursor-from-link";
import {
  variantsAttributesQueryKey,
  variantsListQueryKey,
  variantsProductsQueryKey,
} from "@/lib/query-keys";

export async function fetchAllProducts(): Promise<Product[]> {
  const out: Product[] = [];
  let cursor: string | null = null;
  while (true) {
    const params: Record<string, string> = { page_size: "100" };
    if (cursor) params.cursor = cursor;
    const { data } = await api.get<PaginatedResponse<Product>>("admin/products/", {
      params,
    });
    out.push(...data.results);
    const next = data.next ? cursorFromLink(data.next) : null;
    if (!next) break;
    cursor = next;
  }
  return out;
}

export async function fetchAllAttributes(): Promise<ProductAttributeAdmin[]> {
  const out: ProductAttributeAdmin[] = [];
  let page = 1;
  while (true) {
    const { data } = await api.get<PaginatedResponse<ProductAttributeAdmin>>(
      "admin/product-attributes/",
      { params: { page, page_size: 100 } },
    );
    out.push(...data.results);
    if (!data.next) break;
    page += 1;
  }
  return out;
}

export async function fetchVariantsList(
  opts: { productId?: string; search?: string } = {},
): Promise<ProductVariant[]> {
  const productId = (opts.productId ?? "").trim();
  const search = (opts.search ?? "").trim();
  const acc: ProductVariant[] = [];
  // Cursor pagination (AdminListCursorPagination): follow `next` cursors so a
  // store-wide (no-product) search still returns every matching page.
  let cursor: string | null = null;
  while (true) {
    const params: Record<string, string> = {
      page_size: "100",
      include_inactive: "true",
    };
    if (productId) params.product_public_id = productId;
    if (search) params.search = search;
    if (cursor) params.cursor = cursor;
    const { data } = await api.get<PaginatedResponse<ProductVariant>>(
      "admin/product-variants/",
      { params },
    );
    acc.push(...data.results);
    const next = data.next ? cursorFromLink(data.next) : null;
    if (!next) break;
    cursor = next;
  }
  return acc;
}

export function useVariantProductsQuery() {
  return useQuery({
    queryKey: variantsProductsQueryKey,
    queryFn: fetchAllProducts,
  });
}

export function useVariantAttributesQuery() {
  return useQuery({
    queryKey: variantsAttributesQueryKey,
    queryFn: fetchAllAttributes,
  });
}

export function useVariantsListQuery(opts: { productId?: string; search?: string }) {
  const productId = (opts.productId ?? "").trim();
  const search = (opts.search ?? "").trim();
  return useQuery({
    queryKey: variantsListQueryKey(productId, search),
    queryFn: () => fetchVariantsList({ productId, search }),
    // Product selected → its variants; otherwise a store-wide SKU/option search.
    enabled: !!productId || !!search,
  });
}
