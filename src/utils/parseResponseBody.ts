import isJsonResponse from "./isJsonResponse";

export default async function parseResponseBody<T>(
  res: Response,
  mode: "json" | "text" | "blob" = "json",
): Promise<T> {
  // 204/205 — тела нет
  if (res.status === 204 || res.status === 205) return null;

  if (mode === "json") {
    if (!isJsonResponse(res)) {
      // сервер прислал не JSON → читаем как текст, НО не падаем
      return null;
    }
    // безопасный JSON-парс через text() — так ты можешь обработать пустую строку
    const raw = await res.text();
    if (raw.trim() === "") return null; // пустое тело считаем null
    try {
      return JSON.parse(raw);
    } catch (e) {
      // тут реши, как классифицируешь: 'NETWORK' или 'HTTP'/'SCHEMA'
      // Я бы пометил как нарушение контракта ответа
      throw Object.assign(new Error("Invalid JSON in response"), {
        code: "INVALID_JSON",
        raw,
      });
    }
  }

  // if (mode === "text") return await res.text();
  return null;
}
