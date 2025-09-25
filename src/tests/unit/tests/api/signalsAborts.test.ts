import { describe, it, expect } from "vitest";
import { combineSignals } from "@/shared/api/api";

describe("combineSignals", () => {
  it("immediately aborted if any input is already aborted", () => {
    const a = new AbortController();
    a.abort();
    const b = new AbortController();
    const s = combineSignals(a.signal, b.signal);
    expect(s.aborted).toBe(true);
  });

  it("aborts when any child aborts later", () => {
    const a = new AbortController();
    const b = new AbortController();
    const s = combineSignals(a.signal, b.signal);
    b.abort();
    expect(s.aborted).toBe(true);
  });
});
