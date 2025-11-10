vi.mock("@/entities/tracks", () => ({
  fetchTracksAPI: vi.fn(),
}));

vi.mock("@vueuse/core", async () => {
  const actual = await vi.importActual<any>("@vueuse/core");
  return {
    ...actual,
    useLocalStorage: <T>(_: string, initial: T) =>
      ref(structuredClone(initial)) as any,
  };
});

// vi.mock("@/utils/shuffleArray.ts");
// import shuffleArray from "@/utils/shuffleArray";
// const shuffleArrayMock = vi.mocked(shuffleArray);

import { createPinia, setActivePinia } from "pinia";
import { test, beforeEach, afterEach, describe, vi, expect } from "vitest";
import type { Track, TracksFilters, TracksResponse } from "~/types";
import type { Result } from "~/shared/api";

import * as tracksApi from "@/entities/tracks";
const apiMock = vi.mocked(tracksApi);

import { useTracksStore } from "@/stores/tracks";
import { usePlaybackStore } from "@/stores/playback";
import { useFiltersStore } from "@/stores/filters";
// import { cloneDeep } from "lodash";

beforeEach(() => {
  setActivePinia(createPinia());

  localStorage.clear();

  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.resetModules();

  apiMock.fetchTracksAPI.mockResolvedValue(
    getMockedResponseObject({
      totalPages: 1,
      tracksLimit: 10,
      totalTracks: 10,
      tracksCount: 10,
      currentPage: 1,
    })
  );
});

afterEach(() => {
  try {
    const { usePlaybackStore } = require("@/stores/playback");
    const { useTracksStore } = require("@/stores/tracks");
    usePlaybackStore().$dispose?.();
    useTracksStore().$dispose?.();
  } catch {}
});

const getMockedResponseObject = ({
  tracksLimit,
  totalPages,
  error = null,
  tracksCount,
  totalTracks,
  currentPage = 1,
  withoutAudioFiles,
  startFrom, // NEW
}: {
  error?: any;
  tracksCount: number;
  tracksLimit: number;
  totalPages: number;
  totalTracks: number;
  currentPage: number;
  withoutAudioFiles?: boolean;
  startFrom?: number; // NEW
}): Result<TracksResponse> => {
  const totalTracksCount = tracksCount; // don't cap if you want custom page sizes
  const pageStartFrom =
    typeof startFrom === "number" ? startFrom : (currentPage - 1) * tracksLimit;

  return {
    ok: !!!error,
    error,
    data: !!error
      ? null
      : {
          data: Array.from(
            { length: totalTracksCount },
            (_, k) =>
              ({
                title: `title${pageStartFrom + (k + 1)}`,
                album: "album",
                artist: "artist",
                genres: ["Hip-Hop"],
                id: `${pageStartFrom + (k + 1)}`,
                audioFile: withoutAudioFiles ? "" : "/test-audio-file.mp3",
              } as Track)
          ),
          meta: {
            page: currentPage,
            totalPages,
            total: totalTracks,
            limit: tracksLimit,
          },
        },
  };
};

describe("playback queue", () => {
  test("when tracks are empty there is no playback queue", async () => {
    const playback = usePlaybackStore();

    expect(playback.queue.length).toBe(0);
    expect(playback.hasNextTrack).toBe(false);
    expect(playback.hasPrevTrack).toBe(false);
  });

  test("if queue is not empty music do not start to play automatically and do not set first track as current playing", async () => {
    const tracks = useTracksStore();
    const playback = usePlaybackStore();

    await tracks.fetchTracks({ page: 1 });

    await nextTick();

    expect(playback.playingTrackId).toBe(null);
    expect(playback.queue.length).toBe(10);
    expect(playback.hasNextTrack).toBe(false);
    expect(playback.hasPrevTrack).toBe(false);
  });
  test("if track is selected to play he will automatically play and set as currentPlaying", async () => {
    const tracks = useTracksStore();
    const playback = usePlaybackStore();

    await tracks.fetchTracks({ page: 1 });

    await nextTick();

    playback.setPlayingTrackId("1");
    expect(playback.playingTrackId).toBe("1");
    expect(playback.isPlaying).toBe(true);
  });

  test("if not current playing track, navigate forward should not be accessable", async () => {
    const tracks = useTracksStore();
    const playback = usePlaybackStore();

    await tracks.fetchTracks({ page: 1 });

    await nextTick();

    playback.nextTrack();

    expect(playback.playingTrackId).toBeNull();
  });

  test("if not current playing track, navigate back should not be accessable", async () => {
    const tracks = useTracksStore();
    const playback = usePlaybackStore();

    await tracks.fetchTracks({ page: 1 });

    await nextTick();

    playback.prevTrack();

    expect(playback.playingTrackId).toBeNull();
  });

  test("if track is skipped via navigate forward button next track will turn on", async () => {
    const tracks = useTracksStore();
    const playback = usePlaybackStore();

    await tracks.fetchTracks({ page: 1 });

    await nextTick();

    playback.setPlayingTrackId("1");

    expect(playback.isPlaying).toBe(true);
    expect(playback.playingTrackId).toBe("1");

    playback.nextTrack();

    playback.setPlayingTrackId("2");
    expect(playback.isPlaying).toBe(true);
  });

  test("if track is skipped via navigate back button next track will turn on", async () => {
    const tracks = useTracksStore();
    const playback = usePlaybackStore();

    await tracks.fetchTracks({ page: 1 });

    await nextTick();

    playback.setPlayingTrackId("2");

    expect(playback.isPlaying).toBe(true);
    expect(playback.playingTrackId).toBe("2");

    playback.prevTrack();

    playback.setPlayingTrackId("1");
    expect(playback.isPlaying).toBe(true);
  });

  test.skip("if track is play to the end, next track will turn automatically", async () => {
    const tracks = useTracksStore();
    const playback = usePlaybackStore();

    await tracks.fetchTracks({ page: 1 });

    await nextTick();

    vi.useFakeTimers();

    expect(playback.playingTrackId).toBe(null);
    expect(playback.queue.length).toBe(2);
    expect(playback.hasNextTrack).toBe(false);
    expect(playback.hasPrevTrack).toBe(false);

    playback.setPlayingTrackId("1");
    expect(playback.playingTrackId).toBe("1");
    expect(playback.queue.length).toBe(1);

    // vi.wa(20000);

    // expect(playback.playingTrackId).toBe("2");
    // expect(playback.queue.length).toBe(0);

    // expect(playback.hasNextTrack).toBe(true);
    // expect(playback.hasPrevTrack).toBe(false);
  });
});

describe("queue preload (no shuffle)", () => {
  test("if no current track selected fetch next page should not be triggered initially", async () => {
    const tracks = useTracksStore();
    const playback = usePlaybackStore();

    apiMock.fetchTracksAPI.mockReset();

    apiMock.fetchTracksAPI.mockResolvedValueOnce(
      getMockedResponseObject({
        totalPages: 2,
        tracksLimit: 6,
        totalTracks: 30,
        tracksCount: 2,
        currentPage: 1,
      })
    );

    await tracks.fetchTracks({ page: 1 });

    await nextTick();

    expect(playback.queue.length).toBe(2);

    expect(apiMock.fetchTracksAPI).toHaveBeenCalledTimes(1);

    playback.nextTrack(); // should not work

    await nextTick();

    expect(apiMock.fetchTracksAPI).toHaveBeenCalledTimes(1);
  });

  test("all track plays in existing sequence due to the current tracks list order", async () => {});

  // TODO
  test("when turn track that is last in loaded queue but current page is not last next page should be loaded (with current filters)", async () => {
    const tracks = useTracksStore();
    const playback = usePlaybackStore();
    const filters = useFiltersStore();

    const notDefaultFilters: Omit<TracksFilters, "page"> = {
      artist: "testArtistValue",
      genre: "testGenreValue",
      search: "testSearchValue",
      order: "desc",
      sort: "artist",
    };

    filters.artist = notDefaultFilters.artist!;
    filters.genre = notDefaultFilters.genre!;
    filters.search = notDefaultFilters.search!;
    filters.order = notDefaultFilters.order!;
    filters.sort = notDefaultFilters.sort!;

    vi.resetAllMocks();
    apiMock.fetchTracksAPI.mockReset();

    apiMock.fetchTracksAPI
      .mockResolvedValueOnce(
        getMockedResponseObject({
          totalPages: 2,
          tracksLimit: 2,
          totalTracks: 4,
          tracksCount: 2,
          currentPage: 1,
        })
      )
      .mockResolvedValueOnce(
        getMockedResponseObject({
          totalPages: 2,
          tracksLimit: 2,
          totalTracks: 4,
          tracksCount: 2,
          currentPage: 2,
        })
      );

    await tracks.fetchTracks({ page: 1 });

    expect(apiMock.fetchTracksAPI).toHaveBeenCalledWith({ page: 1 });

    expect(playback.queue.length).toBe(2);

    playback.setPlayingTrackId("1");
    expect(playback.hasNextTrack).toBe(true);
    expect(playback.hasPrevTrack).toBe(false);

    playback.nextTrack();

    await nextTick();

    expect(apiMock.fetchTracksAPI).toHaveBeenCalledTimes(2);
    expect(apiMock.fetchTracksAPI).toHaveBeenNthCalledWith(2, {
      ...notDefaultFilters,
      page: 2,
    });

    playback.nextTrack(); // 3
    playback.nextTrack(); // 4 (last track should not fetch again)

    await nextTick();
    expect(apiMock.fetchTracksAPI).toHaveBeenCalledTimes(2);
  });

  test("auto-preload when playing through pages (user lands and plays; watcher fetches more)", async () => {
    const tracks = useTracksStore();
    const playback = usePlaybackStore();

    vi.resetAllMocks();
    apiMock.fetchTracksAPI.mockReset();

    const first = 2;
    const second = 3;
    const third = 1;

    apiMock.fetchTracksAPI
      .mockResolvedValueOnce(
        getMockedResponseObject({
          totalPages: 3,
          tracksLimit: 3,
          totalTracks: 6,
          tracksCount: first,
          currentPage: 1,
          startFrom: 0,
        })
      )
      .mockResolvedValueOnce(
        getMockedResponseObject({
          totalPages: 3,
          tracksLimit: 3,
          totalTracks: 6,
          tracksCount: second,
          currentPage: 2,
          startFrom: first,
        })
      )
      .mockResolvedValueOnce(
        getMockedResponseObject({
          totalPages: 3,
          tracksLimit: 3,
          totalTracks: 6,
          tracksCount: third,
          currentPage: 3,
          startFrom: first + second,
        })
      )
      .mockResolvedValue(
        getMockedResponseObject({
          totalPages: 3,
          tracksLimit: 3,
          totalTracks: 6,
          tracksCount: 0,
          currentPage: 3,
          startFrom: first + second,
        })
      );

    await tracks.fetchTracks({ page: 1 });

    expect(playback.globalQueue.length).toBe(first);

    playback.setPlayingTrackId("1");
    playback.nextTrack(); // now at "2" (end of page 1) → triggers watcher

    await vi.waitUntil(() => playback.globalQueue.length === first + second);

    expect(playback.globalQueue.length).toBe(first + second);

    playback.nextTrack(); // 3
    playback.nextTrack(); // 4
    playback.nextTrack(); // 5

    await vi.waitUntil(
      () => playback.globalQueue.length === first + second + third
    );

    expect(playback.globalQueue.length).toBe(first + second + third);
  });

  // TODO:
  test("if tracks filters are changed current queue should not change, rather should stay with loaded data", async () => {});
  test("if tracks filters are changed and play last track with not last page of tracks, should be loaded next page of already played tracks not current filtered", async () => {});
  test("tracks queue should update with new filters only if user select some track with new filters then new queue will build from current tracks list", async () => {});
  test("if queue was build from filtered tracks and its time to load next page then next page should be loaded with current filters", async () => {});
});

describe.skip("queue preload (with shuffle)", () => {
  test(
    "when new page is loaded this is should concat to the existing queue and also shuffle, existing queue should not shuffle again"
  );
});

describe("playback navigation with no loop enabled", () => {
  test("if play the last tracks from queue and try to navigate forward tracks should stop play end reset current playback time to zero", async () => {
    const tracks = useTracksStore();
    const playback = usePlaybackStore();

    await tracks.fetchTracks({ page: 1 });

    await nextTick();

    expect(playback.isShuffle).toBe(false);

    playback.setPlayingTrackId("10");

    expect(playback.playingTrackId).toBe("10");
    expect(playback.isPlaying).toBe(true);
    expect(playback.hasNextTrack).toBe(false);

    playback.nextTrack();

    expect(playback.playingTrackId).toBe("10");
    expect(playback.isPlaying).toBe(false);
    // expect(playback.currentPlaybackTime).toBe(0);
  });
});

describe("playback navigation with loop playlist enabled (no shuffle)", () => {
  test("when playing not last track from queue ", async () => {
    const tracks = useTracksStore();
    const playback = usePlaybackStore();

    await tracks.fetchTracks({ page: 1 });

    await nextTick();

    expect(playback.isShuffle).toBe(false);

    playback.setPlayingTrackId("10");
    playback.changeLoopMode();
    expect(playback.loopingMode).toBe("loopPlaylist");

    expect(playback.playingTrackId).toBe("10");
    expect(playback.isPlaying).toBe(true);
    expect(playback.hasNextTrack).toBe(false);

    playback.nextTrack();

    expect(playback.playingTrackId).toBe("1");
    expect(playback.isPlaying).toBe(true);
  });
});

describe("playback navigation with loop playlist enabled (with shuffle)", () => {
  test("when playing end queue should not be regenerate", async () => {
    const tracks = useTracksStore();
    const playback = usePlaybackStore();

    await tracks.fetchTracks({ page: 1 });

    await nextTick();

    playback.changeLoopMode();
    expect(playback.loopingMode).toBe("loopPlaylist");

    expect(playback.isShuffle).toBe(false);
    playback.toggleShuffle();
    expect(playback.isShuffle).toBe(true);

    const oldQueue = playback.queue.map((i) => i.id);

    expect(oldQueue).toHaveLength(10);

    playback.setPlayingTrackId(oldQueue[oldQueue.length - 1]!);

    playback.nextTrack();

    expect(playback.playingTrackId).toBe(oldQueue[0]);
    expect(oldQueue).toEqual(playback.queue.map((i) => i.id));
  });
});

describe.skip("playback navigation with loop track enabled", () => {
  test('press to "next track" button should set current track to the start and keep play', async () => {});
  test('if current playback time is below 3s press to the "back track" button should set current track to the start and keep play', async () => {});
  test('if current playback time is under 3s press to "back track" button should change loop mode to the "loop playlist" and turn prev track', async () => {});
});

// describe.skip("playback shuffle", () => {
//   test("if toggle shuffle mode current track should not be changed and all other tracks should be shuffled and insert after current track", async () => {
//     const tracks = useTracksStore();
//     const playback = usePlaybackStore();

//     await tracks.fetchTracks({ page: 1 });
//     await nextTick();

//     expect(playback.isShuffle).toBe(false);
//     expect(playback.queue).toHaveLength(10);

//     playback.setPlayingTrackId("1");

//     shuffleArrayMock
//       .mockResolvedValueOnce([
//         {
//           title: "title10",
//           album: "album",
//           artist: "artist",
//           genres: ["Hip-Hop"],
//           id: "10",
//           audioFile: "/test-audio-file.mp3",
//         },
//         {
//           title: "title1",
//           album: "album",
//           artist: "artist",
//           genres: ["Hip-Hop"],
//           id: "1",
//           audioFile: "/test-audio-file.mp3",
//         },
//         {
//           title: "title2",
//           album: "album",
//           artist: "artist",
//           genres: ["Hip-Hop"],
//           id: "2",
//           audioFile: "/test-audio-file.mp3",
//         },
//         {
//           title: "title3",
//           album: "album",
//           artist: "artist",
//           genres: ["Hip-Hop"],
//           id: "3",
//           audioFile: "/test-audio-file.mp3",
//         },
//         {
//           title: "title4",
//           album: "album",
//           artist: "artist",
//           genres: ["Hip-Hop"],
//           id: "4",
//           audioFile: "/test-audio-file.mp3",
//         },
//         {
//           title: "title5",
//           album: "album",
//           artist: "artist",
//           genres: ["Hip-Hop"],
//           id: "5",
//           audioFile: "/test-audio-file.mp3",
//         },
//         {
//           title: "title6",
//           album: "album",
//           artist: "artist",
//           genres: ["Hip-Hop"],
//           id: "6",
//           audioFile: "/test-audio-file.mp3",
//         },
//         {
//           title: "title7",
//           album: "album",
//           artist: "artist",
//           genres: ["Hip-Hop"],
//           id: "7",
//           audioFile: "/test-audio-file.mp3",
//         },
//         {
//           title: "title8",
//           album: "album",
//           artist: "artist",
//           genres: ["Hip-Hop"],
//           id: "8",
//           audioFile: "/test-audio-file.mp3",
//         },
//         {
//           title: "title9",
//           album: "album",
//           artist: "artist",
//           genres: ["Hip-Hop"],
//           id: "9",
//           audioFile: "/test-audio-file.mp3",
//         },
//       ] as Track[])
//       .mockResolvedValueOnce([
//         {
//           title: "title1",
//           album: "album",
//           artist: "artist",
//           genres: ["Hip-Hop"],
//           id: "1",
//           audioFile: "/test-audio-file.mp3",
//         },
//         {
//           title: "title2",
//           album: "album",
//           artist: "artist",
//           genres: ["Hip-Hop"],
//           id: "2",
//           audioFile: "/test-audio-file.mp3",
//         },
//         {
//           title: "title3",
//           album: "album",
//           artist: "artist",
//           genres: ["Hip-Hop"],
//           id: "3",
//           audioFile: "/test-audio-file.mp3",
//         },
//         {
//           title: "title4",
//           album: "album",
//           artist: "artist",
//           genres: ["Hip-Hop"],
//           id: "4",
//           audioFile: "/test-audio-file.mp3",
//         },
//         {
//           title: "title5",
//           album: "album",
//           artist: "artist",
//           genres: ["Hip-Hop"],
//           id: "5",
//           audioFile: "/test-audio-file.mp3",
//         },
//         {
//           title: "title6",
//           album: "album",
//           artist: "artist",
//           genres: ["Hip-Hop"],
//           id: "6",
//           audioFile: "/test-audio-file.mp3",
//         },
//         {
//           title: "title7",
//           album: "album",
//           artist: "artist",
//           genres: ["Hip-Hop"],
//           id: "7",
//           audioFile: "/test-audio-file.mp3",
//         },
//         {
//           title: "title8",
//           album: "album",
//           artist: "artist",
//           genres: ["Hip-Hop"],
//           id: "8",
//           audioFile: "/test-audio-file.mp3",
//         },
//         {
//           title: "title9",
//           album: "album",
//           artist: "artist",
//           genres: ["Hip-Hop"],
//           id: "9",
//           audioFile: "/test-audio-file.mp3",
//         },
//         {
//           title: "title10",
//           album: "album",
//           artist: "artist",
//           genres: ["Hip-Hop"],
//           id: "10",
//           audioFile: "/test-audio-file.mp3",
//         },
//       ] as Track[]);

//     playback.toggleShuffle();
//     expect(playback.queue.map((i) => i.id)).toMatchInlineSnapshot();
//     const initialShuffle = playback.queue.map((i) => i.id);

//     playback.toggleShuffle(); // sequentonal order again
//     playback.toggleShuffle(); // shuffle again

//     expect(playback.queue.map((i) => i.id)).toMatchInlineSnapshot();

//     expect(playback.queue[0]?.id).toBe("1");
//     expect(playback.queue.map((i) => i.id)).not.toEqual(initialShuffle);

//     // playback.toggleShuffle(); // sequentonal order again
//     // playback.toggleShuffle(); // shuffle again

//     // expect(playback.queue[0]?.id).toBe("1");
//     // expect(playback.queue.map((i) => i.id)).not.toBe(initialShuffle);
//   });

//   test("if no current track toggle shuffle mode current track should not be changed and all other tracks should not preserve first track", async () => {
//     const tracks = useTracksStore();
//     const playback = usePlaybackStore();

//     await tracks.fetchTracks({ page: 1 });
//     await nextTick();

//     expect(playback.isShuffle).toBe(false);
//     expect(playback.queue).toHaveLength(10);

//     playback.toggleShuffle();
//     const initialShuffle = playback.queue.map((i) => i.id);

//     playback.toggleShuffle(); // sequentonal order again
//     playback.toggleShuffle(); // shuffle again

//     expect(playback.queue[0]?.id).not.toBe(initialShuffle[0]);
//     expect(playback.queue.map((i) => i.id)).not.toBe(initialShuffle);

//     playback.toggleShuffle(); // sequentonal order again
//     playback.toggleShuffle(); // shuffle again

//     expect(playback.queue[0]?.id).not.toBe(initialShuffle[0]);
//     expect(playback.queue.map((i) => i.id)).not.toBe(initialShuffle);
//   });
// });
