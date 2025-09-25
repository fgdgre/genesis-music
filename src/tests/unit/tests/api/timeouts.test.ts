import { describe, it, expect, vi } from "vitest";
import { createApiClient, invalidateAll } from "@/shared/api/api";
import { installFetchMock } from "../../utils/fetchMock";

describe("global elapsed timeout", () => {
  it("stops due to maxElapsedMs and maps to TIMEOUT", async () => {
    vi.useFakeTimers();

    const fetchSpy = installFetchMock([
      // A response so slow that only the global cap will abort it:
      { type: "json", body: { ok: true }, delayMs: 60_000 },
    ]);

    const api = createApiClient("http://x", {
      timeoutMs: 5_000, // large per-attempt
      retry: {
        attempts: 10,
        methods: ["GET"],
        when: ["timeout"],
        maxElapsedMs: 100,
      },
    });

    const p = api.get("slow", {});
    await vi.advanceTimersByTimeAsync(200); // exceed global cap

    const res = await p;
    expect(res.ok).toBe(false);
    expect(res.error.code).toBe("TIMEOUT");
    expect(fetchSpy).toHaveBeenCalledTimes(1); // aborted during first attempt

    fetchSpy.mockRestore();
    vi.useRealTimers();
  });
});

describe("per-call timeoutMs overrides", () => {
  it("shorter per-call timeout overrides default → TIMEOUT (no retry)", async () => {
    invalidateAll();
    vi.useFakeTimers();

    const fetchSpy = installFetchMock([
      // server is slow (1s), per-call timeout will be 80ms
      { type: "json", body: { ok: true }, delayMs: 1000 },
    ]);

    const api = createApiClient("http://x", {
      timeoutMs: 5000, // big default
      retry: { attempts: 1 }, // no retry
    });

    const p = api.get("slow", { timeoutMs: 80 }); // <-- per-call override
    await vi.advanceTimersByTimeAsync(1000); // let the timer/abort fire

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
      // server returns after 200ms; default would be too short, override saves it
      { type: "json", body: { ok: true }, delayMs: 200 },
    ]);

    const api = createApiClient("http://x", {
      timeoutMs: 100, // short default
      retry: { attempts: 1 },
    });

    const p = api.get("slow", { timeoutMs: 1000 }); // <-- longer than default
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
      // every attempt is slow (1s), per-call timeout is 80ms, so each attempt times out
      { type: "json", body: { ok: true }, delayMs: 1000 },
      { type: "json", body: { ok: true }, delayMs: 1000 },
      { type: "json", body: { ok: true }, delayMs: 1000 },
    ]);

    const api = createApiClient("http://x", {
      timeoutMs: 5000, // default irrelevant; we override per-call
      retry: {
        attempts: 3, // 1 initial + 2 retries total
        methods: ["GET"],
        when: ["timeout"], // only retry on timeout
        maxElapsedMs: 30_000, // keep large so the global cap doesn't intervene
      },
    });

    const p = api.get("slow", { timeoutMs: 80 }); // <-- per-call override
    // Advance enough time for 3 attempts to each time out at 80ms (be generous)
    await vi.advanceTimersByTimeAsync(10_000);

    const res = await p;
    expect(res.ok).toBe(false);
    expect(res.error.code).toBe("TIMEOUT");
    expect(fetchSpy).toHaveBeenCalledTimes(3); // 3 slow attempts

    fetchSpy.mockRestore();
    vi.useRealTimers();
  });
});
