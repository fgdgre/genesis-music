import type { NewTrack } from "@/types";

export const postTrack = async (track: NewTrack) => {
  try {
    const response = await fetch("api/tracks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(track),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errText}`);
    }

    const data = await response.json();

    return { data, error: null };
  } catch (e: any) {
    console.log(e);
    return { data: null, error: e };
  }
};
