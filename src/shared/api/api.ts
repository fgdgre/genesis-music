import type { ZodSchema } from "zod";
import { TracksResponse } from "./schema";
import isJsonResponse from "@/utils/isJsonResponse";

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
      retryOn: "network-or-5xx";
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

const connector = async <T>(
  path: string,
  opts?: RequestInit,
): Promise<Result<T>> => {
  try {
    const res = await fetch(path, {
      ...opts,
      ...(opts.body ? { body: JSON.stringify(opts.body) } : {}),
    });

    if (res.ok) {
      if (isJsonResponse(res)) {
        let data = await res.json();

        const validateResponse = TracksResponse.safeParse(data);

        if (!validateResponse.success) {
          return {
            ok: false,
            error: {
              code: "SCHEMA",
              message:
                validateResponse.error.errors[0].message ||
                "Received data is not supported structure",
            },
            response: res,
          };
        }

        return { ok: true, data, response: res };
      }

      return { ok: true, data: null, response: res };
    } else {
      if (isJsonResponse(res)) {
        const error = await res.json();

        return { ok: false, error, response: res };
      }

      const errorMessage = await res.text();

      return {
        ok: false,
        error: { code: "SCHEMA", message: errorMessage },
        response: res,
      };
    }
  } catch (error: any) {
    return { ok: false, error };
  }
};

export interface ApiClient {
  get<T>(
    path: string,
    opts?: Omit<RequestOptions<T>, "method" | "body">,
  ): Promise<Result<T>>;
  post<T>(
    path: string,
    opts?: Omit<RequestOptions<T>, "method">,
  ): Promise<Result<T>>;
  put<T>(
    path: string,
    opts?: Omit<RequestOptions<T>, "method">,
  ): Promise<Result<T>>;
  patch<T>(
    path: string,
    opts?: Omit<RequestOptions<T>, "method">,
  ): Promise<Result<T>>;
  delete<T>(
    path: string,
    opts?: Omit<RequestOptions<T>, "method">,
  ): Promise<Result<T>>;
}

const apiClient: ApiClient = {
  get: async <T>(
    path: string,
    opts: Omit<RequestOptions<T>, "method" | "body">,
  ) => {
    return await connector(path, { method: "GET", ...opts });
  },
  post: async <T>(path: string, opts: Omit<RequestOptions<T>, "method">) => {
    return await connector(path, { method: "POST", ...opts });
  },
  put: async <T>(path: string, opts: Omit<RequestOptions<T>, "method">) => {
    return await connector(path, { method: "PUT", ...opts });
  },
  patch: async <T>(path: string, opts: Omit<RequestOptions<T>, "method">) => {
    return await connector(path, { method: "patch", ...opts });
  },
  delete: async <T>(path: string, opts: Omit<RequestOptions<T>, "method">) => {
    return await connector(path, { method: "DELETE", ...opts });
  },
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
    get: async <T>(
      path: string,
      opts: Omit<RequestOptions<T>, "method" | "body">,
    ) => {
      return await connector(`${baseURL}/${path}`, {
        method: "GET",
        ...defaults,
        ...opts,
      });
    },
    post: async <T>(path: string, opts: Omit<RequestOptions<T>, "method">) => {
      return await connector(`${baseURL}/${path}`, {
        method: "POST",
        ...defaults,
        ...opts,
      });
    },
    put: async <T>(path: string, opts: Omit<RequestOptions<T>, "method">) => {
      return await connector(`${baseURL}/${path}`, {
        method: "PUT",
        ...defaults,
        ...opts,
      });
    },
    patch: async <T>(path: string, opts: Omit<RequestOptions<T>, "method">) => {
      return await connector(`${baseURL}/${path}`, {
        method: "patch",
        ...defaults,
        ...opts,
      });
    },
    delete: async <T>(
      path: string,
      opts: Omit<RequestOptions<T>, "method">,
    ) => {
      return await connector(`${baseURL}/${path}`, {
        method: "DELETE",
        ...defaults,
        ...opts,
      });
    },
  };
}
