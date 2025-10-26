// @vitest-environment node

import { describe, it, expect, vi, afterEach } from "vitest";
import * as z from "zod";
import { installFetchMock } from "../../utils/fetchMock";
import { createApiClient } from "~/shared/api";
import { queriesCache, invalidateAll } from "~/shared/api/api";

Object.defineProperty(globalThis, "navigator", {
  value: { onLine: true },
  configurable: true,
});

// Clean slate between tests
afterEach(() => {
  invalidateAll();

  vi.useRealTimers();
  vi.restoreAllMocks();
  // reset to online by default
  Object.defineProperty(globalThis.navigator, "onLine", {
    value: true,
    configurable: true,
  });
});

describe("API client scenarios (fetch mocked by call order)", () => {
  it("parses json and validates schema", async () => {
    const fetchSpy = installFetchMock([
      { type: "json", body: ["rock", "jazz"] },
    ]);

    const api = createApiClient("http://x", {
      timeoutMs: 80,
      retry: { attempts: 1 },
    });

    const res = await api.get("api/genres", { schema: z.array(z.string()) });
    expect(res.ok).toBe(true);
    expect(res.data).toEqual(["rock", "jazz"]);

    fetchSpy.mockRestore();
  });

  it("HTTP 5xx → retries then succeeds", async () => {
    const fetchSpy = installFetchMock([
      {
        type: "json",
        status: 500,
        body: { statusCode: 500, message: "boom1" },
      },
      {
        type: "json",
        status: 500,
        body: { statusCode: 500, message: "boom2" },
      },
      { type: "json", status: 200, body: { items: [], total: 0 } },
    ]);

    const api = createApiClient("http://x", {
      timeoutMs: 80,
      retry: {
        attempts: 3,
        methods: ["GET"],
        when: ["http-5xx"],
        maxElapsedMs: 500,
      },
    });

    const res = await api.get("api/tracks", {});
    expect(res.ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(3);

    fetchSpy.mockRestore();
  });

  it("Network error → NETWORK", async () => {
    // Simulate offline
    Object.defineProperty(globalThis.navigator, "onLine", {
      value: false,
      configurable: true,
    });

    const fetchSpy = installFetchMock([
      { type: "reject", error: new TypeError("fetch failed") },
    ]);

    const api = createApiClient("http://x", {
      timeoutMs: 80,
      retry: { attempts: 1, when: ["network"] },
    });

    const res = await api.get("api/genres", {});
    expect(res.ok).toBe(false);
    expect(res.error.code).toBe("NETWORK");

    fetchSpy.mockRestore();
  });

  it("Per-attempt timeout → TIMEOUT (fake timers)", async () => {
    vi.useFakeTimers();

    const fetchSpy = installFetchMock([
      // respond after 1000ms; client timeout is 80ms
      { type: "json", body: { ok: true }, delayMs: 1000 },
    ]);

    const api = createApiClient("http://x", {
      timeoutMs: 80,
      retry: { attempts: 1 },
    });

    const p = api.get("slow", {});
    await vi.advanceTimersByTimeAsync(1000);

    const res = await p;
    expect(res.ok).toBe(false);
    expect(res.error.code).toBe("TIMEOUT");

    fetchSpy.mockRestore();
  });

  it("External AbortController → ABORTED", async () => {
    const fetchSpy = installFetchMock([
      // long delay so we can abort first
      { type: "json", body: { ok: true }, delayMs: 1000 },
    ]);

    const api = createApiClient("http://x", {
      timeoutMs: 5000,
      retry: { attempts: 1 },
    });

    const ac = new AbortController();
    const p = api.get("api/genres", { signal: ac.signal });
    ac.abort(); // immediately abort

    const res = await p;
    expect(res.ok).toBe(false);
    expect(res.error.code).toBe("ABORTED");

    fetchSpy.mockRestore();
  });

  it("Schema mismatch → SCHEMA", async () => {
    const fetchSpy = installFetchMock([
      { type: "json", body: ["rock", "jazz"] },
    ]);

    const api = createApiClient("http://x", {
      retry: { attempts: 1 },
    });

    const schema = z.object({ items: z.array(z.string()) });
    const res = await api.get("api/genres", { schema });

    expect(res.ok).toBe(false);
    expect(res.error.code).toBe("SCHEMA");
    expect(Array.isArray(res.error.details)).toBe(true);

    fetchSpy.mockRestore();
  });
});
