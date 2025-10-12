import type { Track } from "~/types";

// tiny seeded RNG (deterministic if seed provided)
export function mulberry32(seed = Math.floor(Math.random() * 2 ** 31)) {
  return function () {
    let t = (seed += 0x6d2b79f5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickRandom<T>(arr: T[], rnd: () => number) {
  return arr[Math.floor(rnd() * arr.length)];
}

function shuffled<T>(input: readonly T[], rnd: () => number): T[] {
  const a = input.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pushWithMaxLen<T>(list: T[], item: T, maxLen: number) {
  if (maxLen <= 0) return;
  list.push(item);
  if (list.length > maxLen) list.shift();
}

/**
 * Fair/perceptual shuffle for Track[]
 * - Spreads same artist (artistCooldown) and same album (albumCooldown)
 * - Relaxes constraints if needed (when only "conflicting" items remain)
 */
export default function fairShuffle(
  tracks: readonly Track[],
  opts?: {
    seed?: number;
    artistCooldown?: number; // distance to keep between same-artist songs
    albumCooldown?: number; // distance to keep between same-album songs
  }
): Track[] {
  const { seed, artistCooldown = 2, albumCooldown = 1 } = opts || {};

  const rnd = mulberry32(seed);

  // group by artist, and pre-shuffle each bucket
  const byArtist = new Map<string, Track[]>();
  for (const t of tracks) {
    const key = t.artist || "__no_artist__";
    const bucket = byArtist.get(key) ?? [];
    bucket.push(t);
    byArtist.set(key, bucket);
  }
  for (const [k, bucket] of byArtist) {
    byArtist.set(k, shuffled(bucket, rnd));
  }

  if (tracks.length <= 2) return shuffled(tracks, rnd);

  const out: Track[] = [];
  const recentArtists: string[] = [];
  const recentAlbums: string[] = [];

  const availableArtists = (avoid: Set<string>) => {
    const entries = [...byArtist.entries()].filter(([, b]) => b.length > 0);
    if (!entries.length) return [] as { key: string; left: number }[];
    const list = entries
      .map(([key, bucket]) => ({ key, left: bucket.length }))
      .filter(({ key }) => !avoid.has(key));
    // prefer buckets with more remaining; randomize ties a bit
    return list.sort((a, b) => b.left - a.left || (rnd() < 0.5 ? -1 : 1));
  };

  while (out.length < tracks.length) {
    const avoidA = new Set(recentArtists);
    let candidatesA = availableArtists(avoidA);

    let chosenArtist: string | null = null;
    let chosenTrack: Track | null = null;

    const tryPick = (
      artists: { key: string; left: number }[],
      relaxAlbum: boolean
    ) => {
      for (const { key } of artists) {
        const bucket = byArtist.get(key)!;
        const prefer = bucket.filter((t) =>
          relaxAlbum ? true : !recentAlbums.includes(t.album || "__no_album__")
        );
        if (prefer.length) {
          chosenArtist = key;
          chosenTrack = pickRandom(prefer, rnd);
          return true;
        }
      }
      return false;
    };

    // strict (avoid same artist & album)
    let ok = tryPick(candidatesA, false);
    // relax album first if needed
    if (!ok) ok = tryPick(candidatesA, true);
    // then relax artist if still no pick
    if (!ok) {
      const candidatesB = availableArtists(new Set());
      ok = tryPick(candidatesB, true);
    }
    // last resort
    if (!ok) {
      const any = [...byArtist.entries()].find(([, b]) => b.length > 0);
      if (!any) break;
      chosenArtist = any[0];
      chosenTrack = any[1][0];
    }

    // commit
    const bucket = byArtist.get(chosenArtist!)!;
    const idx = bucket.findIndex((t) => t.id === chosenTrack!.id);
    bucket.splice(idx, 1);

    out.push(chosenTrack!);
    pushWithMaxLen(recentArtists, chosenArtist!, artistCooldown);
    pushWithMaxLen(
      recentAlbums,
      chosenTrack!.album || "__no_album__",
      albumCooldown
    );
  }

  return out;
}
