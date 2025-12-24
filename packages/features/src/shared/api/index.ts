/**
 * Shared API
 *
 * API client utilities and helpers.
 * Reusable across features and entities.
 */

/**
 * Generic fetch wrapper with error handling.
 */
export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Creates a URL with query parameters.
 */
export function buildUrl(
  base: string,
  params?: Record<string, string | number | boolean | undefined>,
): string {
  if (!params) return base;

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query ? `${base}?${query}` : base;
}
