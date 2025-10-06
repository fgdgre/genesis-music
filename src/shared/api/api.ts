import parseResponseBody from "@/utils/parseResponseBody";
import type {
  RequestOptions,
  ApiClient,
  ApiError,
  RetryOptions,
} from "./types";
import { buildQuery } from "@/utils/buildQuery";
import {
  combineSignals,
  configureRequestOptions,
  getApiError,
  injectApiClientOptions,
} from "./helpers";

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

const connector = async <T>(
  path: string,
  opts: RequestOptions,
  vueQuerySignal?: AbortSignal,
): Promise<T> => {
  const signal = combineSignals(vueQuerySignal, opts.signal);

  try {
    const query = buildQuery(opts.query);

    const res: Response = await fetch(`${path}${query ? `?${query}` : ""}`, {
      ...opts,
      ...configureRequestOptions(opts.body),
      signal,
    });

    const parsedBody = await parseResponseBody(res, opts.parse);

    if (!res.ok)
      throw new RequestError(
        getApiError(
          parsedBody,
          opts.signal,
          vueQuerySignal,
          signal,
        ) as ApiError,
      );

    if (opts.schema) {
      const { success, error } = opts.schema.safeParse(parsedBody);

      if (!success) {
        throw new RequestError({
          code: "SCHEMA",
          message: "Received data is not supported structure",
          details: error.issues,
        });
      }

      return parsedBody as T;
    }

    return parsedBody as T;
  } catch (e) {
    throw new RequestError(
      getApiError(e, opts.signal, vueQuerySignal, signal) as ApiError,
    );
  }
};

const apiClient: ApiClient = {
  get: async <T>(
    path: string,
    opts: Omit<RequestOptions, "method" | "body">,
  ): Promise<T> =>
    await connector<T>(path, {
      method: "GET",
      ...opts,
    }),
  post: async <T>(
    path: string,
    opts: Omit<RequestOptions, "method">,
  ): Promise<T> =>
    await connector<T>(path, {
      method: "POST",
      ...opts,
    }),
  put: async <T>(
    path: string,
    opts: Omit<RequestOptions, "method">,
  ): Promise<T> =>
    await connector<T>(path, {
      method: "PUT",
      ...opts,
    }),
  patch: async <T>(
    path: string,
    opts: Omit<RequestOptions, "method">,
  ): Promise<T> =>
    await connector<T>(path, {
      method: "PATCH",
      ...opts,
    }),
  delete: async <T>(
    path: string,
    opts: Omit<RequestOptions, "method">,
  ): Promise<T> =>
    await connector<T>(path, {
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
