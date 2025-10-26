// @vitest-environment node

import { describe, it, expect, vi } from "vitest";
import { createApiClient, invalidateAll } from "@/shared/api";
import { installFetchMock } from "../../utils/fetchMock";

describe("global elapsed timeout", () => {
  it("stops due to maxElapsedMs and maps to TIMEOUT", async () => {
    vi.useFakeTimers();

    const fetchSpy = installFetchMock([
      { type: "json", body: { ok: true }, delayMs: 60_000 },
    ]);

    const api = createApiClient("http://x", {
      timeoutMs: 5_000,
      retry: {
        attempts: 10,
        methods: ["GET"],
        when: ["timeout"],
        maxElapsedMs: 100,
      },
    });

    const p = api.get("slow", {});
    await vi.advanceTimersByTimeAsync(200);

    const res = await p;
    expect(res.ok).toBe(false);
    expect(res.error.code).toBe("TIMEOUT");
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    fetchSpy.mockRestore();
    vi.useRealTimers();
  });
});

describe("per-call timeoutMs overrides", () => {
  it("shorter per-call timeout overrides default → TIMEOUT (no retry)", async () => {
    invalidateAll();
    vi.useFakeTimers();

    const fetchSpy = installFetchMock([
      { type: "json", body: { ok: true }, delayMs: 1000 },
    ]);

    const api = createApiClient("http://x", {
      timeoutMs: 5000,
      retry: { attempts: 1 },
    });

    const p = api.get("slow", { timeoutMs: 80 });
    await vi.advanceTimersByTimeAsync(1000);

    const res = await p;
    expect(res.ok).toBe(false);
    expect(res.error.code).toBe("TIMEOUT");
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    fetchSpy.mockRestore();
    vi.useRealTimers();
  });

  it("longer per-call timeout overrides short default → success", async () => {
    invalidateAll();
    vi.useFakeTimers();

    const fetchSpy = installFetchMock([
      { type: "json", body: { ok: true }, delayMs: 200 },
    ]);

    const api = createApiClient("http://x", {
      timeoutMs: 100,
      retry: { attempts: 1 },
    });

    const p = api.get("slow", { timeoutMs: 1000 });
    await vi.advanceTimersByTimeAsync(200);

    const res = await p;
    expect(res.ok).toBe(true);
    expect(res.error).toBeNull();
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    fetchSpy.mockRestore();
    vi.useRealTimers();
  });

  it('per-call timeout with retries on "timeout" → attempts respected then TIMEOUT', async () => {
    invalidateAll();
    vi.useFakeTimers();

    const fetchSpy = installFetchMock([
      { type: "json", body: { ok: true }, delayMs: 1000 },
      { type: "json", body: { ok: true }, delayMs: 1000 },
      { type: "json", body: { ok: true }, delayMs: 1000 },
    ]);

    const api = createApiClient("http://x", {
      timeoutMs: 5000,
      retry: {
        attempts: 3,
        methods: ["GET"],
        when: ["timeout"],
        maxElapsedMs: 30_000,
      },
    });

    const p = api.get("slow", { timeoutMs: 80 });

    await vi.advanceTimersByTimeAsync(10_000);

    const res = await p;
    expect(res.ok).toBe(false);
    expect(res.error.code).toBe("TIMEOUT");
    expect(fetchSpy).toHaveBeenCalledTimes(3);

    fetchSpy.mockRestore();
    vi.useRealTimers();
  });
});
