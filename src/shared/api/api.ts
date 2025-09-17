import type { ZodSchema } from "zod";
import { TracksResponseSchema } from "./schema";
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

export type Ok = { ok: true; data: any; response?: Response };
export type Fail = { ok: false; error: ApiError; response?: Response };
export type Result = Ok | Fail;

export type RetryPolicy = {
  retries: number;
  minDelayMs: number;
  maxDelayMs: number;
  retryOn: ApiErrorCode[];
};

export type ParseMode = "json" | "text" | "blob"; // default: 'json'

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, unknown>; // сериализуй корректно: массивы, null/undefined
  body?: any; // если передан объект — JSON.stringify + header
  headers?: Record<string, string>;
  timeoutMs?: number; // default: 8000
  signal?: AbortSignal; // должен учитываться
  retry?: RetryPolicy; // см. поведение ниже
  schema?: ZodSchema<any>; // если задана — валидируй data через schema
  parse?: ParseMode; // default: 'json'
  dedupeKey?: string; // опционально: ключ для дедупликации инфлайт
};

const getErrorCode = (errorCode: number) => {
  console.log(errorCode);
  const errorCodeString = errorCode?.toString();
  if (errorCodeString?.startsWith("5")) {
    return "NETWORK";
  } else if (errorCodeString?.startsWith("4")) {
    return "HTTP";
  } else if (errorCodeString?.startsWith("2")) {
    return "";
  }
};

const connector = async (
  path: string,
  opts?: RequestInit,
): Promise<{ res: Response | null; error: any | null }> => {
  try {
    const res = await fetch(path, {
      ...opts,
      ...(opts?.body ? { body: JSON.stringify(opts.body) } : {}),
    });

    console.log(res);

    if (res.ok) {
      console.log(1);
      return { res, error: null };
    }

    console.log(res);
    console.log(2);
    return {
      res,
      error: { code: getErrorCode(res.status), message: res.statusText },
    };
  } catch (error: any) {
    console.log(3);
    console.log(error);
    return { res: null, error };
  }
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

const validateResponseDataToContract = (contract: ZodSchema, data: any) => {
  return contract.safeParse(data);
};

async function makeRequest(
  path: string,
  opts: RequestOptions,
  retryCount?: number,
): Promise<Ok>;

async function makeRequest(
  path: string,
  opts: RequestOptions,
  retryCount?: number,
): Promise<Fail>;

async function makeRequest(
  path: string,
  opts: RequestOptions,
  retryCount: number = 0,
): Promise<Result> {
  const controller = new AbortController();

  let timer = setTimeout(async () => {
    controller.abort({ code: "TIMEOUT", message: "TIMEOUT" });
  }, opts.timeoutMs);

  const { res, error } = await connector(path, {
    signal: controller.signal,
    ...opts,
  });

  if (error) {
    console.log(res, error);
    if (
      opts.retry &&
      opts.retry.retries !== 0 &&
      opts.retry.retryOn.includes(error.code) &&
      retryCount <= opts.retry.retries
    ) {
      clearTimeout(timer);
      makeRequest(path, opts, retryCount + 1);
    } else {
      clearTimeout(timer);
      return {
        ok: false,
        error,
      };
    }
  } else {
    if (!res) {
      clearTimeout(timer);
      return { ok: false, error: { code: "ABORTED", message: "" } };
    }

    const data = await parseResponseBody(res);

    if (!error) {
      const validatedResponse = validateResponseDataToContract(
        TracksResponseSchema,
        data,
      );

      if (validatedResponse.success && typeof data === "object") {
        clearTimeout(timer);
        return { ok: true, data, response: res };
      }

      clearTimeout(timer);
      return {
        ok: false,
        error: {
          code: "SCHEMA",
          message:
            validatedResponse.error?.errors[0].message ||
            "Received data is not supported structure",
        },
        response: res,
      };
    }
  }
}

const apiClient: ApiClient = {
  get: async (path: string, opts: Omit<RequestOptions, "method" | "body">) =>
    await makeRequest(path, { method: "GET", ...opts }),
  post: async (path: string, opts: Omit<RequestOptions, "method">) =>
    await makeRequest(path, { method: "POST", ...opts }),
  put: async (path: string, opts: Omit<RequestOptions, "method">) =>
    await makeRequest(path, { method: "PUT", ...opts }),
  patch: async (path: string, opts: Omit<RequestOptions, "method">) =>
    await makeRequest(path, { method: "PATCH", ...opts }),
  delete: async (path: string, opts: Omit<RequestOptions, "method">) =>
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
    get: async (path: string, opts: Omit<RequestOptions, "method" | "body">) =>
      await makeRequest(`${baseURL}/${path}`, {
        method: "GET",
        ...defaults,
        ...opts,
      }),
    post: async (path: string, opts: Omit<RequestOptions, "method">) =>
      await makeRequest(`${baseURL}/${path}`, {
        method: "POST",
        ...defaults,
        ...opts,
      }),
    put: async (path: string, opts: Omit<RequestOptions, "method">) =>
      await makeRequest(`${baseURL}/${path}`, {
        method: "PUT",
        ...defaults,
        ...opts,
      }),
    patch: async (path: string, opts: Omit<RequestOptions, "method">) =>
      await makeRequest(`${baseURL}/${path}`, {
        method: "PATCH",
        ...defaults,
        ...opts,
      }),
    delete: async (path: string, opts: Omit<RequestOptions, "method">) =>
      await makeRequest(`${baseURL}/${path}`, {
        method: "DELETE",
        ...defaults,
        ...opts,
      }),
  };
}
