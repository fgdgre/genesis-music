export const fetchTrackByTitleAPI = async (slug: string) => {
  try {
    const response = await fetch(`api/tracks/${slug}`);

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Error while editing: ${errorMessage}`);
    } else {
      const data = response.json();
      return { data, error: null };
    }
  } catch (e) {
    return { data: null, error: e };
  }
};
