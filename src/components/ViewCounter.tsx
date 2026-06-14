import { useState, useEffect } from "react";

type ViewMap = Record<string, number>;

// Display-only counters share a single GET that returns every page's count, so
// a page with N counters makes 1 request instead of N. The promise is memoized
// at module scope (client-only — it is only ever called from useEffect, never
// during SSR, so there is no cross-request state to leak on the server).
let allViewsPromise: Promise<ViewMap> | null = null;

function fetchAllViews(): Promise<ViewMap> {
  if (!allViewsPromise) {
    allViewsPromise = fetch("/api/views")
      .then((res) => {
        if (!res.ok) throw new Error(`Unexpected response: ${res.status}`);
        return res.json();
      })
      .then((rows: Array<{ pagePath: string; viewCount: number }>) =>
        Object.fromEntries(rows.map((row) => [row.pagePath, row.viewCount])),
      )
      .catch((err) => {
        // Allow a later mount to retry instead of caching the failure forever.
        allViewsPromise = null;
        throw err;
      });
  }
  return allViewsPromise;
}

type ViewState = { count: number | null; failed: boolean };

function useViewCount(pagePath: string, trackView: boolean) {
  const [state, setState] = useState<ViewState>({ count: null, failed: false });

  useEffect(() => {
    let active = true;

    // Tracked pages POST once to increment and read their own fresh count;
    // everyone else reads from the shared batched snapshot.
    const pending = trackView
      ? fetch("/api/views", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pagePath }),
        })
          .then((res) => res.json())
          .then((data: { viewCount: number }) => data.viewCount)
      : fetchAllViews().then((map) => map[pagePath] ?? 0);

    pending
      .then((count) => {
        if (active) setState({ count, failed: false });
      })
      .catch(() => {
        if (active) setState({ count: null, failed: true });
      });

    return () => {
      active = false;
    };
  }, [pagePath, trackView]);

  return state;
}

export default function ViewCounter({
  pagePath,
  label,
  trackView = false,
}: {
  pagePath: string;
  label?: string;
  trackView?: boolean;
}) {
  const { count, failed } = useViewCount(pagePath, trackView);

  // If the count can't be loaded, render nothing so a failed request never
  // leaves a permanent placeholder behind.
  if (failed) return null;

  const loading = count === null;

  // While loading we still render the row (icon + a fixed-width skeleton) so the
  // surrounding meta line reserves its space and doesn't shift when the number
  // arrives.
  return (
    <span
      className={`view-counter${loading ? " view-counter--loading" : ""}`}
      aria-hidden={loading || undefined}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {loading ? (
        <span className="view-counter-skeleton" />
      ) : (
        <>
          {count.toLocaleString()} {label ?? "views"}
        </>
      )}
    </span>
  );
}
