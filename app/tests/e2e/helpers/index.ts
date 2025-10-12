import type { QueryParams, Track } from "@/types";

export function makeTracks(total: number, seed = "tracks"): Track[] {
  const base = Date.UTC(2024, 0, 1, 0, 0, 0);
  const arr = Array.from({ length: total }, (_, i) => {
    const id = `${seed}-${String(i).padStart(4, "0")}`;
    return {
      id,
      title: `Track ${i} ${seed}`,
      artist: `Artist ${i % 7}`,
      album: `Album ${Math.floor(i / 5)}`,
      genres: [`genre-${i % 3}`, ...(i % 5 === 0 ? ["extra"] : [])],
      slug: `track-${i}-${seed}`,
      coverImage: `https://picsum.photos/seed/${encodeURIComponent(id)}/200/200`,
      createdAt: new Date(base + i * 1000).toISOString(),
      updatedAt: new Date(base + i * 2000).toISOString(),
    };
  });
  // newest-first
  return arr.sort((a, b) => (a.createdAt! < b.createdAt! ? 1 : -1));
}

export function filterSort(tracks: Track[], qp: QueryParams): Track[] {
  let out = tracks;
  if (qp.search?.trim()) {
    const q = qp.search.toLowerCase();
    out = out.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q),
    );
  }
  if (qp.artist?.trim())
    out = out.filter(
      (t) => t.artist.toLowerCase() === qp.artist!.toLowerCase(),
    );
  if (qp.genre?.trim())
    out = out.filter((t) =>
      t.genres.some((g) => g.toLowerCase() === qp.genre!.toLowerCase()),
    );

  const sortKey = (qp.sort && qp.sort !== "" ? qp.sort : "createdAt") as
    | "title"
    | "artist"
    | "album"
    | "createdAt";
  const order = (qp.order && qp.order !== "" ? qp.order : "desc") as
    | "asc"
    | "desc";

  out = out.slice().sort((a, b) => {
    const av = (a as any)[sortKey] ?? "";
    const bv = (b as any)[sortKey] ?? "";
    return order === "asc"
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  return out;
}

/** ---------- UI helpers ---------- */
export async function scrollListOrWindow(page: any) {
  const list = page.getByTestId("tracks-list");
  const scrolled = await list
    .evaluate((el: HTMLElement) => {
      const before = el.scrollTop;
      el.scrollTop = el.scrollHeight;
      return el.scrollTop !== before;
    })
    .catch(() => false);
  if (!scrolled) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }
}

export function itemsLocator(page: any) {
  const list = page.getByTestId("tracks-list");
  // prefer direct children; fallback to descendants if your layout wraps
  return list
    .locator(":scope > [data-track-id]")
    .or(list.locator("[data-track-id]"));
}

export async function waitForTracksGet(page: any) {
  await page.waitForResponse(
    (r) => r.url().includes("/api/tracks") && r.request().method() === "GET",
  );
}
