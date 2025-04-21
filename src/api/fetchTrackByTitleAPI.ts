function replaceAllSpaces(str: string): string {
  return str.toLowerCase().replace(/ /g, "-");
}

export const fetchTrackByTitleAPI = async (title: string) => {
  try {
    const response = await fetch(`api/tracks/${replaceAllSpaces(title)}`);

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Error while editing: ${errorMessage}`);
    }
    const res = response.json();

    return { data: res, error: null };
  } catch (e) {
    return { data: null, error: e };
  }
};
