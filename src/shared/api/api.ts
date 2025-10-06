import parseResponseBody from "@/utils/parseResponseBody";
import type {
  Result,
  RequestOptions,
  ApiClient,
  ApiError,
  ApiErrorCode,
  RetryOptions,
} from "./types";
import { buildQuery } from "@/utils/buildQuery";
import { cloneDeep } from "lodash-es";
import { createQueryCache } from "../query/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";

export class RequestError extends Error {
  constructor(opts: ApiError, ...params: any[]) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RequestError);
    }

    this.name = "AppError";
    this.code = opts.code;
    this.message = opts.message;
    this.status = opts.status;
    this.aborted = opts.aborted;
    this.details = opts.details;
  }
}
// HELPERS ----------------------------------------------------------------------
function isAbortError(e: unknown) {
  return e instanceof DOMException
    ? e.name === "AbortError"
    : (e as any)?.name === "AbortError";
}

const getErrorMessage = (
  error: any,
  errorCode: ApiErrorCode | undefined,
): string => {
  if (errorCode === "NETWORK") return "Your offline check your internet";
  if (errorCode === "TIMEOUT") return "Timeout";
  return error.error || error.message;
};

function isOffline() {
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

const getApiCode = (
  error: any,
  timeoutSignal: AbortSignal,
  elapsedSignal: AbortSignal,
  combinedSignals: AbortSignal,
): ApiErrorCode | undefined => {
  if (isAbortError(error) || (combinedSignals as any)?.aborted) {
    return timeoutSignal.aborted || elapsedSignal.aborted
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

const getApiError = (
  error: any,
  timeoutSignal: AbortSignal,
  elapsedSignal: AbortSignal,
  combinedSignals: AbortSignal,
): Omit<ApiError, "code"> & { code: ApiErrorCode | undefined } => {
  const errorCode: ApiErrorCode | undefined = getApiCode(
    error,
    timeoutSignal,
    elapsedSignal,
    combinedSignals,
  );

  return {
    code: errorCode,
    status: error.statusCode,
    details: error.message,
    message: getErrorMessage(error, errorCode),
    aborted: errorCode === "ABORTED",
  };
};

const injectApiClientOptions = (
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

const configureRequestOptions = (body: any) => {
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

const shouldRetry = (
  res: Result,
  requestOptions: RequestOptions,
  retriesCount: number,
) => {
  if (!res.error) return false;
  if (res.ok) return false;
  if (requestOptions.retry?.attempts === 0) return false;
  if (retriesCount === (requestOptions.retry?.attempts || 1) - 1) return false;
  if (!requestOptions.retry?.methods?.includes(requestOptions.method || "GET"))
    return false;

  if (requestOptions.retry.when?.every((i) => typeof i === "string")) {
    if (requestOptions.retry.when!.includes("http-5xx")) {
      return res.error.status.toString().startsWith("5");
    }

    if (requestOptions.retry.when!.includes("http-429")) {
      return res.error.status === 429;
    }
    return requestOptions.retry.when?.includes(res.error.code?.toLowerCase());
  } else if (requestOptions.retry.when?.every((i) => typeof i === "number")) {
    return requestOptions.retry.when?.includes(res.error.status);
  }
};
// -----------------------------------------------------------------------------------------
// export const {
//   values: queriesCache,
//   invalidateAll,
//   invalidateQuery,
//   setQuery,
// } = createQueryCache();

// async function connector(path: string, opts: RequestOptions): Promise<Result> {
//   const query = buildQuery(opts.query);
//   const queryKey = `${path}${query ? `?${query}` : ""}`;

//   if (queriesCache.value[queryKey]) {
//     return {
//       ok: true,
//       data: cloneDeep(queriesCache.value[queryKey]),
//       error: null,
//     };
//   }

//   let retryCount = 0;
//   const elapsedTimeoutController = new AbortController();

//   setTimeout(() => {
//     elapsedTimeoutController.abort();
//   }, opts.retry?.maxElapsedMs || 30000);

//   while (true) {
//     // TODO: request !!!
//     const timeoutController = new AbortController();
//     const signal = combineSignals(
//       timeoutController.signal,
//       opts.signal,
//       elapsedTimeoutController.signal,
//     );

//     const timer = setTimeout(() => {
//       timeoutController.abort();
//     }, opts.timeoutMs);

//     const res: Result = await fetch(queryKey, {
//       ...opts,
//       ...configureRequestOptions(opts.body),
//       signal,
//     })
//       .then(async (res) => {
//         clearTimeout(timer);

//         const data = await parseResponseBody(res);
//         return res.ok
//           ? { ok: true, data, error: null, res }
//           : {
//               ok: false,
//               data: null,
//               error: getApiError(
//                 data,
//                 timeoutController.signal,
//                 elapsedTimeoutController.signal,
//                 signal,
//               ),
//               res,
//             };
//       })
//       .catch((e) => {
//         clearTimeout(timer);

//         return {
//           ok: false,
//           data: null,
//           error: getApiError(
//             e,
//             timeoutController.signal,
//             elapsedTimeoutController.signal,
//             signal,
//           ),
//         };
//       });

//     if (
//       shouldRetry(res, opts, retryCount) &&
//       !elapsedTimeoutController.signal.aborted
//     ) {
//       retryCount += 1;
//       continue;
//     } else {
//       if (!opts.schema) {
//         setQuery(queryKey, res.data);
//         return res;
//       }

//       if ((opts.parse || "json") === "json") {
//         const { success, error } = opts.schema.safeParse(res.data);

//         if (success) {
//           setQuery(queryKey, res.data);
//           return res;
//         }

//         return {
//           ok: false,
//           data: null,
//           error: {
//             code: "SCHEMA",
//             message: "Received data is not supported structure",
//             details: error.issues,
//           },
//           res: res.res,
//         };
//       }

//       return res;
//     }
//   }
// }

const connector = async (
  path: string,
  opts: RequestOptions,
  vueQuerySignal?: AbortSignal,
) => {
  try {
    const query = buildQuery(opts.query);
    const signal = combineSignals(vueQuerySignal, opts.signal);

    const res: Response = await fetch(`${path}${query ? `?${query}` : ""}`, {
      ...opts,
      ...configureRequestOptions(opts.body),
      signal,
    });

    const data = await parseResponseBody(res);

    if (res.ok) {
      if ((opts.parse || "json") === "json") {
        if (opts.schema) {
          const { success, error } = opts.schema.safeParse(data);

          if (success) {
            return data;
          }

          return {
            ok: false,
            data: null,
            error: {
              code: "SCHEMA",
              message: "Received data is not supported structure",
              details: error.issues,
            },
            res: res,
          };
        } else {
          return data;
        }
      }
    } else {
      // throw new RequestError(getApiError(data,signal));
    }
  } catch (e) {
    console.error(e);
    // throw new RequestError(getApiError(data,signal));
  }
};

// const apiClient: ApiClient = {
//   get: async (path: string, opts: Omit<RequestOptions, "method" | "body">) =>
//     await connector(path, { method: "GET", ...opts }),
//   post: async (path: string, opts: Omit<RequestOptions, "method">) =>
//     await connector(path, {
//       method: "POST",
//       ...opts,
//     }),
//   put: async (path: string, opts: Omit<RequestOptions, "method">) =>
//     await connector(path, {
//       method: "PUT",
//       ...opts,
//     }),
//   patch: async (path: string, opts: Omit<RequestOptions, "method">) =>
//     await connector(path, {
//       method: "PATCH",
//       ...opts,
//     }),
//   delete: async (path: string, opts: Omit<RequestOptions, "method">) =>
//     await connector(path, {
//       method: "DELETE",
//       ...opts,
//     }),
// };
const apiClient: ApiClient = {
  get: async (path: string, opts: Omit<RequestOptions, "method" | "body">) =>
    await connector(path, {
      method: "GET",
      ...opts,
    }),
  post: async (path: string, opts: Omit<RequestOptions, "method">) =>
    await connector(path, {
      method: "POST",
      ...opts,
    }),
  put: async (path: string, opts: Omit<RequestOptions, "method">) =>
    await connector(path, {
      method: "PUT",
      ...opts,
    }),
  patch: async (path: string, opts: Omit<RequestOptions, "method">) =>
    await connector(path, {
      method: "PATCH",
      ...opts,
    }),
  delete: async (path: string, opts: Omit<RequestOptions, "method">) =>
    await connector(path, {
      method: "DELETE",
      ...opts,
    }),
};

export function createApiClient(
  baseURL: string,
  defaults: {
    headers?: Record<string, string>;
    timeoutMs?: number;
    retry: RetryOptions;
  },
): ApiClient {
  return injectApiClientOptions(apiClient, baseURL, defaults);
}
