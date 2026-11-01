/**
 * Time formatting utilities to present 12-Hour format (e.g. 4:00 AM – 4:30 AM)
 * across the LIFE OS schedule and timelines.
 */

export function formatSingleTo12H(timeStr: string): string {
  if (!timeStr) return "";
  const trimmed = timeStr.trim();
  if (/am|pm/i.test(trimmed)) return trimmed;

  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return trimmed;

  let h = parseInt(match[1], 10);
  const m = match[2];
  if (isNaN(h)) return trimmed;

  const period = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;

  return `${h}:${m} ${period}`;
}

export function formatTo12H(timeStr: string): string {
  if (!timeStr) return "";
  const trimmed = timeStr.trim();
  if (!trimmed) return "";

  // Check if it's a range separated by en-dash, em-dash, or hyphen
  const parts = trimmed.split(/\s*[–—-]\s*/);
  if (parts.length === 2 && parts[0] && parts[1]) {
    return `${formatSingleTo12H(parts[0])} – ${formatSingleTo12H(parts[1])}`;
  }

  return formatSingleTo12H(trimmed);
}
