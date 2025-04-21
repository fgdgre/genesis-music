export const fetchTracksAPI = async ({ page }: { page: number }) => {
  try {
    const response = await fetch(`api/tracks?page=${page}`);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (e) {
    console.log(e);
    return { data: null, error: e };
  }
};
