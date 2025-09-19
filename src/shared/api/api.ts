import type { ZodSchema } from "zod";
import parseResponseBody from "@/utils/parseResponseBody";
import type {
  Result,
  RetryPolicy,
  RequestOptions,
  ApiClient,
  ApiError,
} from "./types";
import { buildQuery } from "@/utils/buildQuery";

function isAbortError(e: unknown) {
  return e instanceof DOMException
    ? e.name === "AbortError"
    : (e as any)?.name === "AbortError";
}

function combineSignals(inner: AbortSignal, outer?: AbortSignal) {
  if (!outer) return inner;
  if ((AbortSignal as any).any) return (AbortSignal as any).any([inner, outer]);

  const combo = new AbortController();
  const onAbort = () => combo.abort();
  inner.addEventListener("abort", onAbort);
  outer.addEventListener("abort", onAbort);
  if (inner.aborted || outer.aborted) combo.abort();
  return combo.signal;
}

const connector = async (
  path: string,
  opts?: RequestInit,
): Promise<{ res: Response | null; error: ApiError | null }> => {
  try {
    const res = await fetch(path, opts);

    if (res.ok) {
      return { res, error: null };
    }

    return {
      res,
      error: { code: "HTTP", message: res.statusText },
    };
  } catch (error: any) {
    console.log(error);

    if (isAbortError(error) || (opts?.signal as any)?.aborted) {
      return {
        res: null,
        error: { code: "TIMEOUT", message: "Request timed out", aborted: true },
      };
    }

    return {
      res: null,
      error: {
        code: "NETWORK",
        message: String((error as any)?.message ?? error),
      },
    };
  }
};

const validateResponseDataToContract = (contract: ZodSchema, data: any) => {
  const res = contract.safeParse(data);
  if (res.error) {
    return { success: false, message: res.error?.errors[0].message };
  }
  return { success: true, message: "" };
};

async function makeRequest(
  path: string,
  opts: RequestOptions,
  retryCount: number = 0,
): Promise<Result> {
  const controller = new AbortController();
  let timerOut = false;

  let timer = setTimeout(async () => {
    controller.abort();
    timerOut = true;
  }, opts.timeoutMs);

  const signal = combineSignals(controller.signal, opts.signal);

  const { res, error } = await connector(`${path}?${buildQuery(opts.query)}`, {
    ...opts,
    signal,
  });

  clearTimeout(timer);

  if (error) {
    if (
      opts.retry &&
      opts.retry.retries !== 0 &&
      opts.retry.retryOn.includes(error.code) &&
      retryCount < opts.retry.retries
    ) {
      clearTimeout(timer);
      return await makeRequest(path, opts, retryCount + 1);
    } else {
      clearTimeout(timer);

      if (isAbortError(error) || (opts?.signal as any)?.aborted) {
        return {
          ok: false,
          data: null,
          error: timerOut
            ? { code: "TIMEOUT", message: "Request timed out", aborted: true }
            : { code: "ABORTED", message: "Request aborted", aborted: true },
        };
      }

      return {
        ok: false,
        data: null,
        error,
      };
    }
  } else {
    const data = await parseResponseBody(res);

    if (!opts.schema) {
      return { ok: true, data, error: null, response: res };
    }

    const { success: validationSuccess, message: errorMessage } =
      validateResponseDataToContract(opts.schema, data);

    if (validationSuccess && typeof data === "object") {
      clearTimeout(timer);
      return { ok: true, data, error: null, response: res };
    }

    clearTimeout(timer);
    return {
      ok: false,
      data: null,
      error: {
        code: "SCHEMA",
        message: errorMessage || "Received data is not supported structure",
      },
      response: res,
    };
  }
}

const apiClient: ApiClient = {
  get: async (path: string, opts: Omit<RequestOptions, "method" | "body">) =>
    await makeRequest(path, { method: "GET", ...opts }),
  post: async (path: string, opts: Omit<RequestOptions, "method">) =>
    await makeRequest(path, {
      method: "POST",
      ...opts,
    }),
  put: async (path: string, opts: Omit<RequestOptions, "method">) =>
    await makeRequest(path, {
      method: "PUT",
      ...opts,
    }),
  patch: async (path: string, opts: Omit<RequestOptions, "method">) =>
    await makeRequest(path, {
      method: "PATCH",
      ...opts,
    }),
  delete: async (path: string, opts: Omit<RequestOptions, "method">) =>
    await makeRequest(path, {
      method: "DELETE",
      ...opts,
    }),
};

const serializeBody = (data: any, bodySerialize: boolean = true) => {
  return bodySerialize ? JSON.stringify(data) : data;
};

const injectApiClientOptions = (
  baseApiClient: ApiClient,
  baseURL: string,
  defaults?: {
    headers?: Record<string, string>;
    timeoutMs?: number;
    retry?: RetryPolicy;
    bodySerialize?: boolean;
  },
): ApiClient => {
  const httpMethods = ["get", "post", "patch", "put", "delete"] as const;
  const apiClient = { ...baseApiClient } as ApiClient;

  for (const k of httpMethods) {
    const original = baseApiClient[k];
    (apiClient as any)[k] = (path: string, opts: any) =>
      original(`${baseURL}/${path}`, {
        ...defaults,
        ...opts,
        ...(k !== "get" && opts?.body
          ? { body: serializeBody(opts.body, opts.bodySerialize) }
          : {}),
      });
  }
  return apiClient;
};

export function createApiClient(
  baseURL: string,
  defaults?: {
    headers?: Record<string, string>;
    timeoutMs?: number;
    retry?: RetryPolicy;
    bodySerialize?: boolean;
  },
): ApiClient {
  return injectApiClientOptions(apiClient, baseURL, defaults);
}
