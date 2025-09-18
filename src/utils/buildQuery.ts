export function buildQuery(params?: Record<string, any>): string {
  if (!params) return "";

  const qs = new URLSearchParams();

  for (const [key, val] of Object.entries(params)) {
    if (val == null) continue; // skip null/undefined
    if (Array.isArray(val)) {
      if (val.length === 0) continue;
      for (const v of val) qs.append(key, String(v));
    } else if (val !== "") {
      qs.set(key, val instanceof Date ? val.toISOString() : String(val));
    }
  }

  return qs.toString(); // e.g. "page=2&search=lofi%20beats"
}
