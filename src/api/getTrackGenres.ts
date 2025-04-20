export const getTrackGenres = async () => {
  try {
    const response = await fetch("api/genres");

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errText}`);
    }

    const genres = await response.json();
    return { data: genres, error: null };
  } catch (e) {
    console.log(e);
    return { data: null, error: e };
  }
};
