import { describe, it, expect, vi, afterEach } from "vitest";
import { createApiClient, invalidateAll } from "@/shared/api";
import { installFetchMock } from "../../utils/fetchMock";

Object.defineProperty(globalThis, "navigator", {
  value: { onLine: true },
  configurable: true,
});

afterEach(() => {
  invalidateAll();

  vi.useRealTimers();
  vi.restoreAllMocks();
  Object.defineProperty(globalThis.navigator, "onLine", {
    value: true,
    configurable: true,
  });
});

describe("retry gating by method", () => {
  it("POST is not retried even if 5xx", async () => {
    const fetchSpy = installFetchMock([
      { type: "json", status: 500, body: { statusCode: 500, message: "boom" } },
      { type: "json", status: 200, body: { ok: true } },
    ]);

    const api = createApiClient("http://x", {
      timeoutMs: 100,
      retry: { attempts: 3, methods: ["GET"], when: ["http-5xx"] },
    });

    const res = await api.post("api/tracks", { body: { id: "1" } });
    expect(res.ok).toBe(false);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    fetchSpy.mockRestore();
  });
});

describe("429 throttling", () => {
  it("retries on 429 when enabled", async () => {
    const fetchSpy = installFetchMock([
      {
        type: "json",
        status: 429,
        body: { statusCode: 429, message: "too many" },
      },
      { type: "json", status: 200, body: ["ok"] },
    ]);

    const api = createApiClient("http://x", {
      timeoutMs: 100,
      retry: { attempts: 2, methods: ["GET"], when: ["http-429"] },
    });

    const res = await api.get("api/genres", {});
    expect(res.ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    fetchSpy.mockRestore();
  });
});

describe("numeric status-based retry", () => {
  it("retries only for listed codes", async () => {
    const fetchSpy = installFetchMock([
      {
        type: "json",
        status: 503,
        body: { statusCode: 503, message: "svc down" },
      },
      { type: "json", status: 200, body: { ok: true } },
    ]);

    const api = createApiClient("http://x", {
      timeoutMs: 100,
      retry: { attempts: 2, methods: ["GET"], when: [503] },
    });

    const res = await api.get("api/tracks", {});
    expect(res.ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    fetchSpy.mockRestore();
  });
});
