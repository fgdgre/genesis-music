import type { RequestOptions } from "https";
import type {
  ApiClient,
  ApiError,
  ApiErrorCode,
  Result,
  RetryOptions,
} from "../types";

export function isAbortError(e: unknown) {
  return e instanceof DOMException
    ? e.name === "AbortError"
    : (e as any)?.name === "AbortError";
}

export const getErrorMessage = (
  error: any,
  errorCode: ApiErrorCode | undefined,
): string => {
  if (errorCode === "NETWORK") return "Your offline check your internet";
  if (errorCode === "TIMEOUT") return "Timeout";
  return error.error || error.message;
};

export function isOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

export function combineSignals(
  ...signals: Array<AbortSignal | null | undefined>
): AbortSignal {
  const list = signals.filter(Boolean) as AbortSignal[];
  if (list.length <= 1) return list[0] ?? new AbortController().signal;

  const any = (AbortSignal as any).any as
    | ((i: Iterable<AbortSignal>) => AbortSignal)
    | undefined;
  if (typeof any === "function") return any(list);

  const controller = new AbortController();

  // Abort immediately if one is already aborted
  const firstAborted = list.find((s) => s.aborted);
  if (firstAborted) {
    controller.abort(
      (firstAborted as any).reason ?? new DOMException("Aborted", "AbortError"),
    );
    return controller.signal;
  }

  // Otherwise, abort on the first one that fires (auto-removes with once:true)
  const onAbort = (e: Event) => {
    const src = e.target as AbortSignal | null;
    controller.abort(
      (src as any)?.reason ?? new DOMException("Aborted", "AbortError"),
    );
  };
  for (const s of list) s.addEventListener("abort", onAbort, { once: true });

  return controller.signal;
}

export const getApiCode = (
  error: any,
  vueQuerySignal?: AbortSignal,
  outerSignal?: AbortSignal,
  combinedSignals?: AbortSignal,
): ApiErrorCode | undefined => {
  if (isAbortError(error) || (combinedSignals as any)?.aborted) {
    return vueQuerySignal?.aborted || outerSignal?.aborted
      ? "TIMEOUT"
      : "ABORTED";
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

export const getApiError = (
  error: any,
  vueQuerySignal?: AbortSignal,
  outerSignal?: AbortSignal,
  combinedSignals?: AbortSignal,
): Omit<ApiError, "code"> & { code: Omit<ApiErrorCode, "schema"> } => {
  const errorCode: Omit<ApiErrorCode, "schema"> =
    getApiCode(error, vueQuerySignal, outerSignal, combinedSignals) || ""; // ??????????

  return {
    code: errorCode,
    status: error.statusCode,
    details: error.message,
    message: getErrorMessage(error, errorCode as ApiErrorCode),
    aborted: errorCode === "ABORTED",
  };
};

export const injectApiClientOptions = (
  baseApiClient: ApiClient,
  baseURL: string,
  defaults: {
    headers?: Record<string, string>;
    timeoutMs?: number;
    retry?: RetryOptions;
  },
): ApiClient => {
  const httpMethods = ["get", "post", "patch", "put", "delete"] as const;
  const apiClient = { ...baseApiClient } as ApiClient;

  for (const k of httpMethods) {
    const original = baseApiClient[k];
    (apiClient as any)[k] = (path: string, opts: any) => {
      return original(
        baseURL.replace(/\/+$/, "") + "/" + path.replace(/^\/+/, ""),
        {
          ...defaults,
          ...opts,
        },
      );
    };
  }
  return apiClient;
};

export const configureRequestOptions = (body: any) => {
  if (body) {
    if (body instanceof FormData || body instanceof Blob) {
      return { body: body };
    } else {
      return {
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      };
    }
  }
  return {};
};

// export const shouldRetry = (
//   res: Result,
//   requestOptions: RequestOptions,
//   retriesCount: number,
// ) => {
//   if (!res.error) return false;
//   if (res.ok) return false;
//   if (requestOptions.retry?.attempts === 0) return false;
//   if (retriesCount === (requestOptions.retry?.attempts || 1) - 1) return false;
//   if (!requestOptions.retry?.methods?.includes(requestOptions.method || "GET"))
//     return false;

//   if (requestOptions.retry.when?.every((i) => typeof i === "string")) {
//     if (requestOptions.retry.when!.includes("http-5xx")) {
//       return res.error.status.toString().startsWith("5");
//     }

//     if (requestOptions.retry.when!.includes("http-429")) {
//       return res.error.status === 429;
//     }
//     return requestOptions.retry.when?.includes(res.error.code?.toLowerCase());
//   } else if (requestOptions.retry.when?.every((i) => typeof i === "number")) {
//     return requestOptions.retry.when?.includes(res.error.status);
//   }
// };
