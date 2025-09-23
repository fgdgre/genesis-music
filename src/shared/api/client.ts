import { createApiClient } from "./api";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export default createApiClient(BASE_URL, {
  timeoutMs: 8000,
  retry: {
    attempts: 3,
    methods: ["GET", "HEAD"],
    when: ["network", "timeout"],
  },
});
