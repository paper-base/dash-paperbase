"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getBasicAnalyticsOverview,
  type AnalyticsBucket,
  type DashboardAnalyticsPoint,
  type DashboardAnalyticsResponse,
  type DashboardAnalyticsSummary,
} from "@/lib/basicAnalyticsService";

export type {
  AnalyticsBucket,
  DashboardAnalyticsPoint,
  DashboardAnalyticsResponse,
  DashboardAnalyticsSummary,
};

export interface DashboardAnalyticsFilters {
  startDate: string;
  endDate: string;
  bucket: AnalyticsBucket;
}

interface AnalyticsState {
  data: DashboardAnalyticsResponse | null;
  loading: boolean;
  error: string | null;
}

export function useDashboardAnalytics(filters: DashboardAnalyticsFilters) {
  const [state, setState] = useState<AnalyticsState>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchAnalytics = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    getBasicAnalyticsOverview({
      start_date: filters.startDate,
      end_date: filters.endDate,
      bucket: filters.bucket,
    })
      .then((data) => {
        setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        const message =
          error?.response?.data?.detail ||
          error?.message ||
          "Failed to load analytics.";
        setState({ data: null, loading: false, error: message });
      });
  }, [filters.startDate, filters.endDate, filters.bucket]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    ...state,
    refetch: fetchAnalytics,
  };
}
