export const deleteTrackAPI = async (id: string) => {
  try {
    const response = await fetch(`api/tracks/${id}`, { method: "DELETE" });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status} - ${response}`);
    }

    return { data: id, error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: e };
  }
};
