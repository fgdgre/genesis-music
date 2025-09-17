import { createApiClient } from "./api";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const api = createApiClient(BASE_URL, {
  timeoutMs: 8000,
  // headers: { "X-App": "genesis-music" },
  retry: {
    retries: 2,
    minDelayMs: 300,
    maxDelayMs: 1000,
    retryOn: "network-or-5xx",
  },
});
