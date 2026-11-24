import { STALE_HOURS } from "./constants";

export function currentYear(): number {
  return new Date().getFullYear();
}

export function isStale(isoTimestamp: string): boolean {
  const ts = new Date(isoTimestamp).getTime();
  if (Number.isNaN(ts)) return true;
  return Date.now() - ts > STALE_HOURS * 60 * 60 * 1000;
}

export function formatRelative(isoTimestamp: string): string {
  const ts = new Date(isoTimestamp).getTime();
  if (Number.isNaN(ts)) return "Unknown time";
  const diffMs = Date.now() - ts;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

export function formatDateTime(isoTimestamp: string): string {
  const d = new Date(isoTimestamp);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
}

export function formatDate(isoTimestamp: string): string {
  const d = new Date(isoTimestamp);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "long" });
}

export function formatTime(isoTimestamp: string): string {
  const d = new Date(isoTimestamp);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", timeStyle: "short" });
}

/** Current hour in IST (0–23) */
export function currentHourIST(): number {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  ).getHours();
}
