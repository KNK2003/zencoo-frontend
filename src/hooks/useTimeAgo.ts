import { useEffect, useState } from "react";

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const postDate = new Date(dateString);
  const diffMs = now.getTime() - postDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Posted just now";
  if (diffMins < 60) return `Posted ${diffMins} min${diffMins === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `Posted ${diffHours} hr${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 7) return `Posted ${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  const options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" };
  return `Posted on ${postDate.toLocaleDateString(undefined, options)}`;
}

export function useTimeAgo(dateString: string): string {
  const [timeAgo, setTimeAgo] = useState(() => formatTimeAgo(dateString));

  useEffect(() => {
    const update = () => setTimeAgo(formatTimeAgo(dateString));
    const interval = setInterval(update, 60000); // update every minute
    update(); // update immediately in case time has passed since mount
    return () => clearInterval(interval);
  }, [dateString]);

  return timeAgo;
}