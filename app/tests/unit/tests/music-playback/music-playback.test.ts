import { setActivePinia } from "pinia";
import { test, beforeEach, describe, vi, expect } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import type { Track, TracksResponse } from "~/types";
import type { Result } from "~/shared/api";

vi.mock("@/entities/tracks", () => ({
  fetchTracksAPI: vi.fn(),
}));
import * as tracksApi from "@/entities/tracks";
const apiMock = vi.mocked(tracksApi);

import { useTracksStore } from "@/stores/tracks";
import { usePlaybackStore } from "@/stores/playback";

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createTestingPinia({ stubActions: false, createSpy: vi.fn }));
  vi.resetAllMocks();
});

const getMockedResponseObject = ({
  tracksLimit,
  totalPages,
  error = null,
  tracksCount,
  totalTracks,
  currentPage = 1,
}: {
  error?: any;
  tracksCount: number;
  tracksLimit: number;
  totalPages: number;
  totalTracks: number;
  currentPage: number;
}): Result<TracksResponse> => {
  return {
    ok: !!!error,
    error: error,
    data: !!error
      ? null
      : {
          data: Array.from(
            { length: tracksCount > tracksLimit ? tracksLimit : tracksCount },
            (v, k) =>
              ({
                title: `title${k}`,
                album: "album",
                artist: "artist",
                genres: ["Hip-Hop"],
                id: `${k}`,
                audioFile: "/test-audio-file.mp3",
              } as Track)
          ),
          meta: {
            page: currentPage,
            totalPages: totalPages,
            total: totalTracks,
            limit: tracksLimit,
          },
        },
  };
};

const fillTracksToStore = (
  length: number,
  callback: (track: Track) => void
) => {
  for (let i = length; i >= 1; i--) {
    callback({
      title: `title${i}`,
      album: "asd",
      artist: "qwe",
      genres: ["Hip-Hop"],
      id: `${i}`,
      audioFile: "/test-audio-file.mp3",
    } as Track);
  }
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

    apiMock.fetchTracksAPI.mockResolvedValueOnce(
      getMockedResponseObject({
        totalPages: 1,
        tracksLimit: 10,
        totalTracks: 2,
        tracksCount: 2,
        currentPage: 1,
      })
    );

    await tracks.fetchTracks({ page: 1 });

    await nextTick();

    expect(playback.playingTrackId).toBe(null);
    expect(playback.queue.length).toBe(2);
    expect(playback.hasNextTrack).toBe(false);
    expect(playback.hasPrevTrack).toBe(false);
  });
  test("if track is selected to play he will automatically play and set as currentPlaying", async () => {
    const tracks = useTracksStore();
    const playback = usePlaybackStore();

    fillTracksToStore(2, tracks.createTrack);

    await nextTick();

    playback.setPlayingTrackId("1");
    expect(playback.playingTrackId).toBe("1");
    expect(playback.isPlaying).toBe(true);
  });

  test("if not current playing track, navigate forward should not be accessable", async () => {
    const tracks = useTracksStore();
    const playback = usePlaybackStore();

    fillTracksToStore(2, tracks.createTrack);

    await nextTick();

    playback.nextTrack();

    expect(playback.playingTrackId).toBeNull();
  });

  test("if not current playing track, navigate back should not be accessable", async () => {
    const tracks = useTracksStore();
    const playback = usePlaybackStore();

    fillTracksToStore(2, tracks.createTrack);

    await nextTick();

    playback.prevTrack();

    expect(playback.playingTrackId).toBeNull();
  });

  test("if track is skipped via navigate forward button next track will turn on", async () => {
    const tracks = useTracksStore();
    const playback = usePlaybackStore();

    fillTracksToStore(2, tracks.createTrack);

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

    fillTracksToStore(2, tracks.createTrack);

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

    fillTracksToStore(2, tracks.createTrack);

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

describe.skip("queue preload (no shuffle)", () => {
  test("all track plays in existing sequence due to the current tracks list order", async () => {});
  test("when turn track that is last in loaded queue but current page is not last next page should be loaded (with current filters)", async () => {});
  test("when user manually landing to tracks list and load more tracks queue should automatically update", async () => {});
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

    fillTracksToStore(2, tracks.createTrack);

    await nextTick();

    expect(playback.isShuffle).toBe(false);

    playback.setPlayingTrackId("2");

    expect(playback.playingTrackId).toBe("2");
    expect(playback.isPlaying).toBe(true);
    expect(playback.hasNextTrack).toBe(false);

    playback.nextTrack();

    expect(playback.playingTrackId).toBe("2");
    expect(playback.isPlaying).toBe(false);
    // expect(playback.currentPlaybackTime).toBe(0);
  });
});

describe("playback navigation with loop playlist enabled (no shuffle)", () => {
  test("when playing not last track from queue ", async () => {
    const tracks = useTracksStore();
    const playback = usePlaybackStore();

    fillTracksToStore(2, tracks.createTrack);

    await nextTick();

    expect(playback.isShuffle).toBe(false);

    playback.setPlayingTrackId("2");
    playback.changeLoopMode();

    expect(playback.loopingMode).toBe("loopPlaylist");

    expect(playback.playingTrackId).toBe("2");
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

    fillTracksToStore(10, tracks.createTrack);

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

describe.skip("playback shuffle", () => {
  test(
    "if toggle shuffle mode current track should not be changed and all other tracks should be shuffled and insert after current track"
  );
});
