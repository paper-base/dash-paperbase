"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { toLocaleDigits } from "@/lib/locale-digits";
import { Undo2 } from "lucide-react";
import { ClickableText } from "@/components/ui/clickable-text";
import { Input } from "@/components/ui/input";
import { FilterBar } from "@/components/filters/FilterBar";
import { FilterDropdown } from "@/components/filters/FilterDropdown";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useFilters } from "@/hooks/useFilters";
import api from "@/lib/api";
import { useBranding } from "@/context/BrandingContext";
import type { Order, PaginatedResponse } from "@/types";

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${month}-${day}-${year} ${hours}:${minutes}`;
}

function formatStatus(status: string): string {
  if (!status) return "—";
  return status.replace(/_/g, " ");
}

export default function OrdersPage() {
  const router = useRouter();
  const locale = useLocale();
  const tNav = useTranslations("nav");
  const tPages = useTranslations("pages");
  const { currencySymbol } = useBranding();
  const { page, filters, setFilter, setPage, clearFilters } = useFilters([
    "status",
    "date_range",
    "search",
  ]);
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const debouncedSearch = useDebouncedValue(searchInput);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const next = debouncedSearch.trim();
    if (next === (filters.search || "")) return;
    setFilter("search", next);
  }, [debouncedSearch, filters.search, setFilter]);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const params: Record<string, string | number> = { page };
    if (filters.status) params.status = filters.status;
    if (filters.date_range) params.date_range = filters.date_range;
    if (filters.search) params.search = filters.search;
    api
      .get<PaginatedResponse<Order>>("admin/orders/", {
        params,
      })
      .then((res) => {
        setOrders(res.data.results);
        setCount(res.data.count);
        setHasNext(!!res.data.next);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters.date_range, filters.search, filters.status, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map((o) => o.public_id)));
    }
  };

  async function handleDeleteSelected() {
    if (selectedIds.size === 0) return;
    if (
      !confirm(
        tPages("confirmDeleteOrders", {
          count: toLocaleDigits(String(selectedIds.size), locale),
        })
      )
    )
      return;
    setDeleting(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => api.delete(`admin/orders/${id}/`))
      );
      setSelectedIds(new Set());
      fetchOrders();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  const allSelected = orders.length > 0 && selectedIds.size === orders.length;
  const someSelected = selectedIds.size > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-muted/80 px-1 py-1">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label={tPages("goBack")}
              className="flex items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-muted"
            >
              <Undo2 className="h-4 w-4" />
            </button>
          </div>
          <h1 className="text-2xl font-medium leading-relaxed text-foreground">
            {tNav("orders")} ({toLocaleDigits(String(count), locale)})
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {someSelected && (
            <button
              onClick={handleDeleteSelected}
              disabled={deleting}
              className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition hover:bg-destructive/90 disabled:opacity-50"
            >
              {deleting
                ? tPages("deleting")
                : tPages("deleteSelected", {
                    count: toLocaleDigits(String(selectedIds.size), locale),
                  })}
            </button>
          )}
          <Link
            href="/orders/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            {tPages("addOrder")}
          </Link>
        </div>
      </div>

      <FilterBar>
        <FilterDropdown
          value={filters.status}
          onChange={(value) => setFilter("status", value)}
          placeholder={tPages("filtersStatus")}
          options={[
            { value: "pending", label: "Pending" },
            { value: "confirmed", label: "Confirmed" },
            { value: "processing", label: "Processing" },
            { value: "shipped", label: "Shipped" },
            { value: "delivered", label: "Delivered" },
            { value: "cancelled", label: "Cancelled" },
            { value: "returned", label: "Returned" },
          ]}
        />
        <FilterDropdown
          value={filters.date_range}
          onChange={(value) => setFilter("date_range", value)}
          placeholder={tPages("filtersDateRange")}
          options={[
            { value: "today", label: tPages("filtersToday") },
            { value: "last_7_days", label: tPages("filtersLast7Days") },
            { value: "last_30_days", label: tPages("filtersLast30Days") },
          ]}
        />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={tPages("filtersSearchOrders")}
          className="w-full md:w-72"
        />
        <button
          type="button"
          onClick={() => {
            setSearchInput("");
            clearFilters();
          }}
          className="h-9 rounded-md border border-border px-3 text-sm hover:bg-muted"
        >
          {tPages("filtersClear")}
        </button>
      </FilterBar>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-dashed border-card-border bg-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="w-10 px-2 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="form-checkbox"
                      aria-label="Select all orders on this page"
                    />
                  </th>
                  <th className="th">Order #</th>
                  <th className="th">Customer</th>
                  <th className="th">Phone</th>
                  <th className="th">Status</th>
                  <th className="th">Total</th>
                  <th className="th">Shipping zone</th>
                  <th className="th">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {orders.map((order) => (
                  <tr key={order.public_id} className="hover:bg-muted/40">
                    <td className="w-10 px-2 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(order.public_id)}
                        onChange={() => toggleSelect(order.public_id)}
                        className="form-checkbox"
                        aria-label={`Select order ${order.order_number}`}
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <ClickableText
                        href={`/orders/${order.public_id}`}
                        className="whitespace-nowrap"
                      >
                        {order.order_number}
                      </ClickableText>
                    </td>
                    <td className="px-4 py-3 text-foreground whitespace-nowrap">
                      {order.shipping_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-foreground whitespace-nowrap">
                      {order.phone || "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs font-medium capitalize text-foreground">
                        {formatStatus(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground whitespace-nowrap">
                      {currencySymbol}{Number(order.total).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {order.shipping_zone_public_id || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="btn-page"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">Page {page}</span>
            <button
              disabled={!hasNext}
              onClick={() => setPage(page + 1)}
              className="btn-page"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
