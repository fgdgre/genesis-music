import { createApiClient } from "./api";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export default createApiClient(BASE_URL, {
  timeoutMs: 1500,
  retry: {
    attempts: 3,
    methods: ["GET", "HEAD"],
    when: ["network"],
    maxElapsedMs: 15000,
  },
});
