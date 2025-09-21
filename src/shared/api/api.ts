import type { ZodSchema } from "zod";
import parseResponseBody from "@/utils/parseResponseBody";
import type {
  Result,
  RetryPolicy,
  RequestOptions,
  ApiClient,
  ApiError,
  ApiErrorCode,
} from "./types";
import { buildQuery } from "@/utils/buildQuery";

// HELPERS ----------------------------------------------------------------------
const validateResponseDataToContract = (contract: ZodSchema, data: any) => {
  const res = contract.safeParse(data);
  if (res.error) {
    return { success: false, message: res.error?.errors[0].message };
  }
  return { success: true, message: "" };
};

function isAbortError(e: unknown) {
  return e instanceof DOMException
    ? e.name === "AbortError"
    : (e as any)?.name === "AbortError";
}

function isOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

const getApiCode = (
  error: any,
  timeoutController: AbortSignal,
  signal: AbortSignal,
): ApiErrorCode | undefined => {
  console.log(timeoutController.aborted);
  if (isAbortError(error) || (signal as any)?.aborted) {
    return timeoutController.aborted ? "TIMEOUT" : "ABORTED";
  }
  if (
    error.statusCode?.toString().startsWith(4) ||
    error.statusCode?.toString().startsWith(5)
  ) {
    return "HTTP";
  }
  if (isOffline()) {
    return "NETWORK";
  }
};

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

const getErrorMessage = (
  error: any,
  errorCode: ApiErrorCode | undefined,
): string => {
  if (errorCode === "NETWORK") return "Your offline check your internet";
  if (errorCode === "TIMEOUT") return "Timeout";
  return error.error || error.message;
};

const getApiError = (
  error: any,
  timeoutController: AbortSignal,
  signal: AbortSignal,
): Omit<ApiError, "code"> & { code: ApiErrorCode | undefined } => {
  const errorCode: ApiErrorCode | undefined = getApiCode(
    error,
    timeoutController,
    signal,
  );
  console.log({
    code: errorCode,
    status: error.statusCode,
    details: error.message,
    message: getErrorMessage(error, errorCode),
    aborted: errorCode === "ABORTED",
  });

  return {
    code: errorCode,
    status: error.statusCode,
    details: error.message,
    message: getErrorMessage(error, errorCode),
    aborted: errorCode === "ABORTED",
  };
};

const serializeBody = (data: any, bodySerialize: boolean = true) => {
  return bodySerialize ? JSON.stringify(data) : data;
};

// -----------------------------------------------------------------------------------------

const connector = async (
  path: string,
  opts?: RequestInit,
): Promise<{ res: Response | null; error: any | null }> => {
  try {
    const res = await fetch(path, opts);

    if (res.ok) {
      return { res, error: null };
    }

    const error = await res.json();
    console.log(res, error);
    return {
      res,
      error,
    };
  } catch (error: any) {
    console.log(error);
    return { res: null, error };
  }
};

async function makeRequest(
  path: string,
  opts: RequestOptions,
  retryCount: number = 0,
): Promise<Result> {
  const timeoutController = new AbortController();

  let timer = setTimeout(async () => {
    timeoutController.abort();
  }, opts.timeoutMs);

  const signal = combineSignals(timeoutController.signal, opts.signal);

  const { res, error } = await connector(`${path}?${buildQuery(opts.query)}`, {
    ...opts,
    signal,
  });

  clearTimeout(timer);

  if (error) {
    console.log(error);
    const apiError = getApiError(error, timeoutController.signal, signal);

    if (
      opts.method === "GET" &&
      opts.retry &&
      opts.retry.retries !== 0 &&
      opts.retry.retryOn.includes(apiError.code) &&
      retryCount < opts.retry.retries
    ) {
      return await makeRequest(path, opts, retryCount + 1);
    }

    return {
      ok: false,
      data: null,
      error: apiError,
    };
  } else {
    const data = await parseResponseBody(res, opts.parse);

    if (!opts.schema) {
      return { ok: true, data, error: null, response: res };
    }

    const { success: validationSuccess, message: errorMessage } =
      validateResponseDataToContract(opts.schema, data);

    if (validationSuccess && typeof data === "object") {
      return { ok: true, data, error: null, response: res };
    }

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
