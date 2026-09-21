// Lightweight date formatting helpers (replaces date-fns to keep bundles small).

const cache = new Map<string, Intl.DateTimeFormat>();

function fmt(options: Intl.DateTimeFormatOptions) {
  const key = JSON.stringify(options);
  let f = cache.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", options);
    cache.set(key, f);
  }
  return f;
}

/** e.g. "Mar 4" */
export function formatMonthDay(date: Date) {
  return fmt({ month: "short", day: "numeric" }).format(date);
}

/** e.g. "Mar 4, 2026" */
export function formatMonthDayYear(date: Date) {
  return fmt({ month: "short", day: "numeric", year: "numeric" }).format(date);
}

/** e.g. "March 2026" */
export function formatMonthYear(date: Date) {
  return fmt({ month: "long", year: "numeric" }).format(date);
}
