/**
 * adminFetch — wraps fetch() with Authorization: Bearer <token>
 * Use this for every admin API call instead of raw fetch().
 *
 * For multipart/form-data (file uploads), pass `body` as FormData —
 * do NOT set Content-Type manually; fetch sets it automatically.
 *
 * For JSON, pass `body` as a plain object — it will be JSON.stringify'd.
 */
export async function adminFetch(
  url: string,
  options: {
    method?: string;
    body?: FormData | Record<string, unknown>;
    token: string | null;
  }
): Promise<Response> {
  const { method = "GET", body, token } = options;

  const headers: HeadersInit = {};

  // Always attach token if available
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let fetchBody: FormData | string | undefined;

  if (body instanceof FormData) {
    // Don't set Content-Type — browser sets it with boundary
    fetchBody = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    fetchBody = JSON.stringify(body);
  }

  return fetch(url, { method, headers, body: fetchBody });
}

/**
 * Convenience helper — throws if response is not ok.
 */
export async function adminFetchJson<T = unknown>(
  url: string,
  options: {
    method?: string;
    body?: FormData | Record<string, unknown>;
    token: string | null;
  }
): Promise<T> {
  const res  = await adminFetch(url, options);
  const data = await res.json() as T & { error?: string };
  if (!res.ok || (data as { error?: string }).error) {
    throw new Error((data as { error?: string }).error ?? `Request failed: ${res.status}`);
  }
  return data;
}
