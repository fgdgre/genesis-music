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

export type RetryPolicy = {
  retries: number;
  minDelayMs: number;
  maxDelayMs: number;
  retryOn: ApiErrorCode[];
};

export type ParseMode = "json" | "text" | "blob";

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, unknown>;
  body?: any;
  headers?: Record<string, string>;
  timeoutMs?: number;
  signal?: AbortSignal;
  retry?: RetryPolicy;
  schema?: ZodSchema;
  parse?: ParseMode;
  dedupeKey?: string;
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
