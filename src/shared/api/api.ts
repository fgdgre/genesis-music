import type { ZodSchema } from "zod";
import { TracksResponseSchema } from "./schema";
import isJsonResponse from "@/utils/isJsonResponse";
import parseResponseBody from "@/utils/parseResponseBody";

export type ApiErrorCode =
  | "ABORTED"
  | "TIMEOUT"
  | "NETWORK"
  | "HTTP"
  | "SCHEMA";

export type ApiError = {
  code: ApiErrorCode;
  message: string;
  status?: number; // есть только для HTTP-ошибок
  aborted?: boolean; // true для ABORTED
  details?: unknown; // например, ZodIssue[] для SCHEMA
};

export type Ok<T> = { ok: true; data: T; response: Response };
export type Fail = { ok: false; error: ApiError; response?: Response };
export type Result<T> = Ok<T> | Fail;

export type RetryPolicy =
  | {
      retries: number;
      minDelayMs: number;
      maxDelayMs: number;
      retryOn: ApiErrorCode;
    }
  | { retries: 0 };

export type ParseMode = "json" | "text" | "blob"; // default: 'json'

export type RequestOptions<T> = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, unknown>; // сериализуй корректно: массивы, null/undefined
  body?: any; // если передан объект — JSON.stringify + header
  headers?: Record<string, string>;
  timeoutMs?: number; // default: 8000
  signal?: AbortSignal; // должен учитываться
  retry?: RetryPolicy; // см. поведение ниже
  schema?: ZodSchema<T>; // если задана — валидируй data через schema
  parse?: ParseMode; // default: 'json'
  dedupeKey?: string; // опционально: ключ для дедупликации инфлайт
};

const connector = async (
  path: string,
  opts?: RequestInit,
): Promise<{ res: Response | null; error: ApiError | null }> => {
  try {
    const res = await fetch(path, {
      ...opts,
      ...(opts.body ? { body: JSON.stringify(opts.body) } : {}),
    });

    if (res.ok) {
      return { res, error: null };
    }
    return {
      res,
      error: { code: "HTTP", message: res.statusText, status: res.status },
    };
  } catch (error: any) {
    console.log(error);
    return { res: null, error };
  }
};

export interface ApiClient {
  get(
    path: string,
    opts?: Omit<RequestOptions<any>, "method" | "body">,
  ): Promise<Result<any>>;
  post(
    path: string,
    opts?: Omit<RequestOptions<any>, "method">,
  ): Promise<Result<any>>;
  put(
    path: string,
    opts?: Omit<RequestOptions<any>, "method">,
  ): Promise<Result<any>>;
  patch(
    path: string,
    opts?: Omit<RequestOptions<any>, "method">,
  ): Promise<Result<any>>;
  delete(
    path: string,
    opts?: Omit<RequestOptions<any>, "method">,
  ): Promise<Result<any>>;
}

const validateResponseDataToContract = (contract: ZodSchema, data: any) => {
  // return contract.safeParseAsync(data);
  return { success: true, error: null };
};

const makeRequest = async (
  path: string,
  opts: RequestOptions<any>,
  retryCount = 0,
): Promise<Result<any>> => {
  let timer = setTimeout(async () => {
    return {
      ok: false,
      error: {
        code: "TIMEOUT",
        message: "TIMEOUT",
      },
      response: res,
    };
  }, opts.timeoutMs);

  const { res, error } = await connector(path, { method: "GET", ...opts });

  const data = await parseResponseBody(res);

  if (!error) {
    const validatedResponse = await validateResponseDataToContract(
      TracksResponseSchema,
      data,
    );

    if (validatedResponse.success && typeof data === "object") {
      return { ok: true, data, response: res };
    }

    return {
      ok: false,
      error: {
        code: "SCHEMA",
        message:
          validatedResponse.error.errors[0].message ||
          "Received data is not supported structure",
      },
      response: res,
    };
  }

  if (
    opts.retry &&
    opts.retry.retries !== 0 &&
    error.code === opts.retry.retryOn &&
    retryCount < opts.retry.retries
  ) {
    makeRequest(path, opts, retryCount + 1);
  } else {
    return { ok: false, error };
  }
};

const apiClient: ApiClient = {
  get: async (
    path: string,
    opts: Omit<RequestOptions<any>, "method" | "body">,
  ) => await makeRequest(path, { method: "GET", ...opts }),
  post: async (path: string, opts: Omit<RequestOptions<any>, "method">) =>
    await makeRequest(path, { method: "POST", ...opts }),
  put: async (path: string, opts: Omit<RequestOptions<any>, "method">) =>
    await makeRequest(path, { method: "PUT", ...opts }),
  patch: async (path: string, opts: Omit<RequestOptions<any>, "method">) =>
    await makeRequest(path, { method: "PATCH", ...opts }),
  delete: async (path: string, opts: Omit<RequestOptions<any>, "method">) =>
    await makeRequest(path, { method: "DELETE", ...opts }),
};

export function createApiClient(
  baseURL: string,
  defaults?: {
    headers?: Record<string, string>;
    timeoutMs?: number;
    retry?: RetryPolicy;
  },
): ApiClient {
  return {
    ...apiClient,
    get: async (
      path: string,
      opts: Omit<RequestOptions<any>, "method" | "body">,
    ) =>
      await makeRequest(`${baseURL}/${path}`, {
        method: "GET",
        ...defaults,
        ...opts,
      }),
    post: async (path: string, opts: Omit<RequestOptions<any>, "method">) =>
      await makeRequest(`${baseURL}/${path}`, {
        method: "POST",
        ...defaults,
        ...opts,
      }),
    put: async (path: string, opts: Omit<RequestOptions<any>, "method">) =>
      await makeRequest(`${baseURL}/${path}`, {
        method: "PUT",
        ...defaults,
        ...opts,
      }),
    patch: async (path: string, opts: Omit<RequestOptions<any>, "method">) =>
      await makeRequest(`${baseURL}/${path}`, {
        method: "PATCH",
        ...defaults,
        ...opts,
      }),
    delete: async (path: string, opts: Omit<RequestOptions<any>, "method">) =>
      await makeRequest(`${baseURL}/${path}`, {
        method: "DELETE",
        ...defaults,
        ...opts,
      }),
  };
}
