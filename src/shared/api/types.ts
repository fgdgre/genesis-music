import type { ZodSchema } from "zod";

export type ApiErrorCode =
  | "ABORTED"
  | "TIMEOUT"
  | "NETWORK"
  | "HTTP"
  | "SCHEMA";

export type ApiError = {
  code: ApiErrorCode;
  message: string;
  status?: number;
  aborted?: boolean;
  details?: unknown;
};

export type Result = {
  ok: boolean;
  data: any | null;
  error: any | null;
  response?: Response | null;
};

export type RetryWhen =
  | Array<"network" | "http-5xx" | "http-429" | "timeout">
  | number[];
// | ((ctx: {
//     method: "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE";
//     attempt: number;
//     error?: unknown;
//     response?: Response;
//   }) => boolean);

/** User-friendly retry options */
export type RetryOptions = {
  /** total tries INCLUDING the first attempt. default: 3 (1 + 2 retries) */
  attempts?: number;
  /** which methods are eligible. default: ['GET','HEAD'] */
  methods?: Array<"GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE">;
  /** conditions for retry. default: ['network','http-5xx'] */
  when?: RetryWhen;
  /** optional hard cap across all retries */
  maxElapsedMs?: number;
  /** backoff tuning */
  backoff?: {
    /** base random window (min..max) multiplied by factor^attempt. default: 300..1000 */
    minDelayMs?: number;
    maxDelayMs?: number;
    /** growth factor. default: 2 */
    factor?: number;
    /** jitter strategy. default: 'full' */
    jitter?: "none" | "full" | "decorrelated";
  };
};

export type ParseMode = "json" | "text" | "blob";

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, unknown>;
  body?: any;
  headers?: Record<string, string>;
  timeoutMs?: number;
  signal?: AbortSignal;
  retry?: RetryOptions;
  schema?: ZodSchema;
  parse?: ParseMode;
  dedupeKey?: string;
  bodySerialize?: boolean;
};

export interface ApiClient {
  get(
    path: string,
    opts?: Omit<RequestOptions, "method" | "body">,
  ): Promise<Result>;
  post(path: string, opts?: Omit<RequestOptions, "method">): Promise<Result>;
  put(path: string, opts?: Omit<RequestOptions, "method">): Promise<Result>;
  patch(path: string, opts?: Omit<RequestOptions, "method">): Promise<Result>;
  delete(path: string, opts?: Omit<RequestOptions, "method">): Promise<Result>;
}
