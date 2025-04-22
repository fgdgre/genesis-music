import type { NewTrack, Track } from "@/types";

export const editTrackAPI = async (track: NewTrack) => {
  try {
    const response = await fetch(`api/tracks/${track.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(track),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status} - ${response}`);
    } else {
      const data = await response.json();
      return { data, error: null };
    }
  } catch (e) {
    return { data: null, error: e };
  }
};
