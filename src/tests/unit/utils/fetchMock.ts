// test/utils/fetchMock.ts
import { vi } from "vitest";

type MockPlan =
  | {
      type: "json";
      body: any;
      status?: number;
      delayMs?: number;
      headers?: Record<string, string>;
    }
  | {
      type: "text";
      body: string;
      status?: number;
      delayMs?: number;
      headers?: Record<string, string>;
    }
  | { type: "reject"; error?: any; delayMs?: number };

export function installFetchMock(plans: MockPlan[]) {
  const mock = vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(async (_input: any, init?: RequestInit) => {
      if (plans.length === 0) throw new Error("No more fetch plans");
      const plan = plans.shift()!;
      const delay = (ms = 0) => new Promise((r) => setTimeout(r, ms));

      // respect aborts
      const signal = init?.signal;
      let aborted = false;
      const abortP = signal
        ? new Promise<never>((_, reject) => {
            if (signal.aborted) {
              aborted = true;
              reject(new DOMException("Aborted", "AbortError"));
            } else {
              signal.addEventListener(
                "abort",
                () => {
                  aborted = true;
                  reject(new DOMException("Aborted", "AbortError"));
                },
                { once: true },
              );
            }
          })
        : null;

      const doReply = async () => {
        if (plan.delayMs) await delay(plan.delayMs);
        if (plan.type === "reject") {
          throw plan.error ?? new TypeError("NetworkError");
        }
        if (aborted) throw new DOMException("Aborted", "AbortError");

        const headers = new Headers(plan.headers || {});
        let body: BodyInit | null = null;

        if (plan.type === "json") {
          headers.set("Content-Type", "application/json");
          body = JSON.stringify(plan.body);
        } else {
          headers.set("Content-Type", "text/plain");
          body = plan.body;
        }
        return new Response(body, { status: plan.status ?? 200, headers });
      };

      return abortP ? Promise.race([doReply(), abortP]) : doReply();
    });

  return mock;
}
