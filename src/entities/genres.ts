import { apiClient } from "@/shared/api";

export const fetchGenresAPI = async () => await apiClient.get("api/genres");
