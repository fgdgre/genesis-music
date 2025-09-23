import type { ZodSchema } from "zod";
import parseResponseBody from "@/utils/parseResponseBody";
import type {
  Result,
  RetryPolicy,
  RequestOptions,
  ApiClient,
  ApiError,
  ApiErrorCode,
  RetryOptions,
} from "./types";
import { buildQuery } from "@/utils/buildQuery";

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

const getApiCode = (
  error: any,
  timeoutController: AbortSignal,
  signal: AbortSignal,
): ApiErrorCode | undefined => {
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
    (apiClient as any)[k] = (path: string, opts: any) =>
      original(baseURL.replace(/\/+$/, "") + "/" + path.replace(/^\/+/, ""), {
        ...defaults,
        ...opts,
      });
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
// -----------------------------------------------------------------------------------------

// const connector = async (
//   path: string,
//   opts?: RequestInit,
// ): Promise<{ res: Response | null; error: any | null }> => {
//   try {
//     return { res: await fetch(path, opts), error: null };
//   } catch (error: any) {
//     console.log(error);
//     return { res: null, error };
//   }
// };

// async function makeRequest(
//   path: string,
//   opts: RequestOptions,
//   retryCount: number = 0,
// ): Promise<Result> {
//   const timeoutController = new AbortController();
//   const signal = combineSignals(timeoutController.signal, opts.signal);
//   try {
//     const query = buildQuery(opts.query);

//     let timer = setTimeout(async () => {
//       timeoutController.abort();
//     }, opts.timeoutMs);

//     const res = await fetch(`${path}${query ? `?${query}` : ""}`, {
//       ...opts,
//       ...configureRequestOptions(opts.body),
//       signal,
//     });

//     clearTimeout(timer);

//     console.log(res);
//     const parsedResponse = await parseResponseBody(res, opts.parse);
//     console.log(res, parsedResponse);

//     if (!res.ok) {
//       const apiError = getApiError(
//         parsedResponse,
//         timeoutController.signal,
//         signal,
//       );
//       console.log(parsedResponse, apiError);

//       if (
//         opts.method === "GET" &&
//         opts.retry &&
//         opts.retry.retries !== 0 &&
//         opts.retry.retryOn.includes(apiError.code) &&
//         retryCount < opts.retry.retries
//       ) {
//         return await makeRequest(path, opts, retryCount + 1);
//       }

//       return {
//         ok: false,
//         data: null,
//         error: apiError,
//       };
//     } else {
//       if (!opts.schema) {
//         return { ok: true, data: parsedResponse, error: null, response: res };
//       }

//       if (opts.parse === "json") {
//         const { success, error } = opts.schema.safeParse(parsedResponse);

//         if (success) {
//           return { ok: true, data: parsedResponse, error: null, response: res };
//         }

//         return {
//           ok: false,
//           data: null,
//           error: {
//             code: "SCHEMA",
//             message: "Received data is not supported structure",
//             details: error.issues,
//           },
//           response: res,
//         };
//       }

//       return { ok: true, data: parsedResponse, error: null, response: res };
//     }
//   } catch (e) {
//     return {
//       ok: false,
//       error: getApiError(e, timeoutController.signal, signal),
//     };
//   }
// }

async function connector(
  path: string,
  opts: RequestOptions,
  retryCount: number = 0,
): Promise<Result> {
  // TODO: request !!!
  // const timeoutController = new AbortController();
  // const signal = combineSignals(timeoutController.signal, opts.signal);
  const query = buildQuery(opts.query);

  const res = await fetch(`${path}${query ? `?${query}` : ""}`, {
    ...opts,
    ...configureRequestOptions(opts.body),
  });

  const data = await parseResponseBody(res, opts.parse);

  console.log(res, data);

  // TODO: Retries
  // TODO: global request timeout includes retries
  // TODO: per call timeout
  // TODO: validation of received data
  // TODO: build error due to type
}

const apiClient: ApiClient = {
  get: async (path: string, opts: Omit<RequestOptions, "method" | "body">) =>
    await connector(path, { method: "GET", ...opts }),
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
    retry?: RetryOptions;
  } = {
    headers: { contentType: "application/json" },
    timeoutMs: 8000,
    retry: {
      attempts: 3,
      methods: ["GET", "HEAD"],
      when: ["network"],
      maxElapsedMs: 15000,
    },
  },
): ApiClient {
  return injectApiClientOptions(apiClient, baseURL, defaults);
}
