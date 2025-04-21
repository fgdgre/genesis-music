export const postMusicFileAPI = async (id: string, file: File) => {
  try {
    const formData = new FormData();
    formData.append("upload", file);

    const response = await fetch(`api/tracks/${id}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error while uploading file ${response.status}`);
    } else {
      const data = await response.json();

      return { data, error: null };
    }
  } catch (e) {
    return { data: null, error: e };
  }
};
