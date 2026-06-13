import { useState, useEffect } from "react";

function useViewCounter(pagePath: string, trackView: boolean) {
  const [viewCount, setViewCount] = useState<number | null>(null);

  useEffect(() => {
    if (trackView) {
      fetch("/api/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pagePath }),
      })
        .then((res) => res.json())
        .then((data) => setViewCount(data.viewCount))
        .catch(() => {});
    } else {
      fetch(`/api/views?pagePath=${encodeURIComponent(pagePath)}`)
        .then((res) => res.json())
        .then((data) => setViewCount(data.viewCount))
        .catch(() => {});
    }
  }, [pagePath, trackView]);

  return viewCount;
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
  const viewCount = useViewCounter(pagePath, trackView);

  if (viewCount === null) return null;

  return (
    <span className="view-counter">
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
      {viewCount.toLocaleString()} {label ?? "views"}
    </span>
  );
}
