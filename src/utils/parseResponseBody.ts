import isJsonResponse from "./isJsonResponse";

export default async function parseResponseBody<T>(
  res: Response | null,
  mode: "json" | "text" | "blob" = "json",
): Promise<string | T | Blob | null | undefined> {
  if (!res) return null;

  if (res.status === 204 || res.status === 205) return null;

  if (mode === "json") {
    if (!isJsonResponse(res)) {
      return await res.text();
    }
    const raw = await res.text();
    if (raw.trim() === "") return null;
    try {
      return JSON.parse(raw) as T;
    } catch (e) {
      throw Object.assign(new Error("Invalid JSON in response"), {
        code: "INVALID_JSON",
        raw: raw,
      });
    }
  }

  if (mode === "text") return await res.text();
  return await res.blob();
}
