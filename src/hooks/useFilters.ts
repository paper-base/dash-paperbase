import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";

type FilterMap = Record<string, string>;

function parsePage(value: string | null): number {
  const parsed = Number(value || "1");
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

export function useFilters(filterKeys: string[]) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = useMemo(() => parsePage(searchParams.get("page")), [searchParams]);

  const filters = useMemo<FilterMap>(() => {
    const out: FilterMap = {};
    for (const key of filterKeys) {
      const value = searchParams.get(key);
      if (value) out[key] = value;
    }
    return out;
  }, [filterKeys, searchParams]);

  const applyParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const setFilter = useCallback(
    (key: string, value?: string | null) => {
      applyParams((params) => {
        if (value && value.trim()) params.set(key, value.trim());
        else params.delete(key);
        params.delete("page");
      });
    },
    [applyParams]
  );

  const setPage = useCallback(
    (nextPage: number) => {
      applyParams((params) => {
        if (nextPage <= 1) params.delete("page");
        else params.set("page", String(nextPage));
      });
    },
    [applyParams]
  );

  const clearFilters = useCallback(() => {
    applyParams((params) => {
      for (const key of filterKeys) params.delete(key);
      params.delete("page");
    });
  }, [applyParams, filterKeys]);

  return { page, filters, setFilter, setPage, clearFilters };
}
