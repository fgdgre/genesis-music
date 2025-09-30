import { describe, it, expect, afterEach, vi } from "vitest";
import {
  queriesCache,
  setQuery,
  invalidateQuery,
  invalidateAll,
} from "@/shared/api";

describe("query client (readonly + invalidation)", () => {
  afterEach(() => {
    invalidateAll();
  });

  it("exposes a readonly ref: cannot reassign .value or set keys directly", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const before = queriesCache.value;

    (queriesCache as any).value = { hacked: true };
    expect(queriesCache.value).toBe(before);
    expect(warn).toHaveBeenCalled();

    (queriesCache.value as any).foo = 123;
    expect("foo" in queriesCache.value).toBe(false);

    warn.mockRestore();
  });

  it("setQuery persists; invalidateQuery removes exactly one key", () => {
    setQuery("tracks?page=1", { items: ["a"] });
    setQuery("genres", ["rock"]);

    expect(queriesCache.value["tracks?page=1"]).toEqual({ items: ["a"] });
    expect(queriesCache.value["genres"]).toEqual(["rock"]);

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    delete (queriesCache.value as any)["tracks?page=1"];
    expect(queriesCache.value["tracks?page=1"]).toBeDefined();
    warn.mockRestore();

    invalidateQuery("tracks?page=1");
    expect(queriesCache.value["tracks?page=1"]).toBeUndefined();
    expect(queriesCache.value["genres"]).toEqual(["rock"]);
  });

  it("invalidateAll(prefix) removes only matching keys", () => {
    setQuery("tracks?page=1", { items: ["t1"] });
    setQuery("tracks?page=2", { items: ["t2"] });
    setQuery("genres", ["g1"]);

    const keysBefore = Object.keys(queriesCache.value);
    expect(keysBefore.sort()).toEqual(
      ["genres", "tracks?page=1", "tracks?page=2"].sort(),
    );

    invalidateAll("tracks");

    const keysAfter = Object.keys(queriesCache.value);
    expect(keysAfter).toEqual(["genres"]);
  });

  it("invalidateAll() clears everything", () => {
    setQuery("a", 1);
    setQuery("b", 2);
    expect(Object.keys(queriesCache.value).length).toBe(2);

    invalidateAll();
    expect(Object.keys(queriesCache.value).length).toBe(0);
  });
});
