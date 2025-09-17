export default function isJsonResponse(res: Response) {
  const ct = res.headers.get("content-type") || "";
  // true для application/json; charset=utf-8, application/problem+json, ld+json и т.п.
  return /\bapplication\/json\b|\+json\b/i.test(ct);
}
