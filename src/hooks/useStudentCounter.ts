import { useEffect, useState } from "react";
import { apiFetch, appPath } from "../lib/app-path";

interface CounterState {
  count: number;
  isPulsing: boolean;
  notification: string | null;
  isLoading: boolean;
  error: string | null;
  coursesCount: number | null;
  experienceYears: string | null;
  lastHourIncrease: number | null;
}

interface StatsResponse {
  studentsCount: number;
  baseDisplay: string;
  lastHourIncrease: number;
  nextIncrementMinutes: number;
  coursesCount: number;
  experienceYears: string;
}

export function useStudentCounter(): CounterState {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let timerId: number | undefined;
    let retryDelay = 60_000;

    const refreshStats = async () => {
      try {
        const response = await apiFetch(appPath("/api/stats"), {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("stats_unavailable");
        const nextStats = (await response.json()) as StatsResponse;
        if (!Number.isFinite(nextStats.studentsCount)) {
          throw new Error("invalid_stats");
        }

        setCount(nextStats.studentsCount);
        setStats(nextStats);
        setError(null);
        retryDelay = 60_000;
        const minutesUntilHourlyRefresh = Math.min(
          60,
          Math.max(1, Math.floor(Number(nextStats.nextIncrementMinutes) || 60)),
        );
        timerId = window.setTimeout(
          refreshStats,
          minutesUntilHourlyRefresh * 60_000 + 2_000,
        );
      } catch (reason: unknown) {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError("unavailable");
        timerId = window.setTimeout(refreshStats, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 15 * 60_000);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void refreshStats();
    return () => {
      controller.abort();
      if (timerId !== undefined) window.clearTimeout(timerId);
    };
  }, []);

  return {
    count,
    isPulsing: false,
    notification: null,
    isLoading,
    error,
    coursesCount: stats?.coursesCount ?? null,
    experienceYears: stats?.experienceYears ?? null,
    lastHourIncrease: stats ? Math.min(3, Math.max(0, Math.floor(Number(stats.lastHourIncrease) || 0))) : null,
  };
}
