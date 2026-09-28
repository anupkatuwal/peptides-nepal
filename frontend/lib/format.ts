const npr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 0 });

/** 4500 -> "Rs. 4,500" (Nepali/Indian digit grouping). */
export function formatPrice(value: number): string {
  return `Rs. ${npr.format(value)}`;
}

export function formatPurity(value: number | null): string | null {
  return value === null ? null : `${value.toFixed(2)}%`;
}

export function formatDate(iso: string): string {
  // The API sends UTC without an offset.
  const d = new Date(iso.endsWith("Z") ? iso : `${iso}Z`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kathmandu" });
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
