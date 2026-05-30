export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export function uniqueSlug(base: string, suffix?: string): string {
  const s = suffix ?? Math.random().toString(36).slice(2, 6);
  return `${toSlug(base)}-${s}`;
}
