import { createApiClient } from "./api";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export default createApiClient(BASE_URL, {
  timeoutMs: 1500,
  retry: {
    retries: 2,
    minDelayMs: 300,
    maxDelayMs: 1000,
    retryOn: ["TIMEOUT"],
  },
  bodySerialize: true,
});
