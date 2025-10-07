import { apiClient } from "@/shared/api";
import * as z from "zod";

export const fetchGenresAPI = async () =>
  await apiClient.get<string[]>("api/genres", { schema: z.array(z.string()) });
