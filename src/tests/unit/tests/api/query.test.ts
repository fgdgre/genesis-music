import { describe, it, expect, test } from "vitest";
import * as z from "zod";
import { createApiClient } from "@/shared/api/api";
import { installFetchMock } from "../../utils/fetchMock";
import { invalidateAll, queriesCache } from "@/shared/api/api";

test("", () => {});

// describe("cache invalidation by prefix", () => {
//   it("🔁 Cache stores, deep-clones, and invalidates", async () => {
//     const fetchSpy = installFetchMock([{ type: "json", body: ["rock"] }]);

//     const api = createApiClient("http://x", {
//       retry: { attempts: 1 },
//     });

//     const a = await api.get("api/genres", {});
//     const b = await api.get("api/genres", {});

//     expect(a.ok && b.ok).toBe(true);
//     expect(a.data).not.toBe(b.data); // cloneDeep applied
//     expect(Object.keys(queriesCache.value).length).toBe(1);

//     invalidateAll();
//     expect(Object.keys(queriesCache.value).length).toBe(0);

//     fetchSpy.mockRestore();
//   });

//   it("removes only keys that include the prefix", async () => {
//     const schema = z.object({ items: z.array(z.string()) });

//     const fetchSpy = installFetchMock([
//       { type: "json", body: { items: ["t1"] } }, // /tracks
//       { type: "json", body: { items: ["t2"] } }, // /tracks?page=2
//       { type: "json", body: ["g1"] }, // /genres
//     ]);

//     const api = createApiClient("http://x", { retry: { attempts: 1 } });

//     await api.get("api/tracks", { schema });
//     await api.get("api/tracks", { schema, query: { page: 2 } });
//     await api.get("api/genres", { schema: z.array(z.string()) });

//     const keysBefore = Object.keys(queriesCache.value);
//     expect(keysBefore.some((k) => k.includes("tracks"))).toBe(true);
//     expect(keysBefore.some((k) => k.includes("genres"))).toBe(true);

//     invalidateAll("tracks");

//     const keysAfter = Object.keys(queriesCache.value);
//     expect(keysAfter.some((k) => k.includes("tracks"))).toBe(false);
//     expect(keysAfter.some((k) => k.includes("genres"))).toBe(true);

//     fetchSpy.mockRestore();
//   });
// });

// describe("deep clone on cache hits", () => {
//   it("mutating first result does not affect cached value", async () => {
//     invalidateAll();

//     const fetchSpy = installFetchMock([{ type: "json", body: ["rock"] }]);
//     const api = createApiClient("http://x", { retry: { attempts: 1 } });
//     const schema = z.array(z.string());

//     const a = await api.get("api/genres", { schema }); // fills cache
//     (a.data as string[]).push("metal"); // mutate caller copy

//     const b = await api.get("api/genres", { schema }); // served from cache
//     expect(b.data).toEqual(["rock"]); // cache not polluted
//     expect(a.data).not.toBe(b.data); // deep clone

//     fetchSpy.mockRestore();
//   });
// });
