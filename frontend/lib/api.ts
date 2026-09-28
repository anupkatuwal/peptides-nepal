import type { Category, ProductDetail, ProductPage } from "./types";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Turns FastAPI error bodies (string detail, or a list of validation errors) into one readable message. */
function errorMessage(status: number, body: unknown): string {
  if (status === 429) return "Too many attempts. Please wait a minute and try again.";
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      return detail
        .map((d: { loc?: (string | number)[]; msg?: string }) => {
          const field = d.loc?.filter((p) => p !== "body").join(" › ");
          const msg = (d.msg ?? "Invalid value").replace(/^Value error, /, "");
          return field ? `${field.replace(/_/g, " ")}: ${msg}` : msg;
        })
        .join(". ");
    }
  }
  return status >= 500 ? "The server is having trouble. Please try again shortly." : "Something went wrong.";
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  token?: string | null;
  /** Server-side caching (seconds). Ignored in the browser. */
  revalidate?: number | false;
};

export async function apiFetch<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    ...(opts.revalidate !== undefined
      ? { next: { revalidate: opts.revalidate } }
      : { cache: "no-store" as const }),
  });

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  if (!res.ok) throw new ApiError(res.status, errorMessage(res.status, data));
  return data as T;
}

// --- Server-side catalogue reads (cached for 60 s; fall back gracefully if the API is down) ---

const CATALOGUE_TTL = 60;

export async function getCategories(): Promise<Category[]> {
  try {
    return await apiFetch<Category[]>("/api/categories", { revalidate: CATALOGUE_TTL });
  } catch {
    return [];
  }
}

export async function getProducts(params: {
  category?: string;
  q?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<ProductPage | null> {
  const qs = new URLSearchParams();
  if (params.category) qs.set("category", params.category);
  if (params.q) qs.set("q", params.q);
  if (params.sort) qs.set("sort", params.sort);
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("page_size", String(params.pageSize));
  const query = qs.toString();
  try {
    return await apiFetch<ProductPage>(`/api/products${query ? `?${query}` : ""}`, { revalidate: CATALOGUE_TTL });
  } catch {
    return null;
  }
}

/** Returns null when the product doesn't exist (404); throws on other errors. */
export async function getProduct(slug: string): Promise<ProductDetail | null> {
  try {
    return await apiFetch<ProductDetail>(`/api/products/${encodeURIComponent(slug)}`, { revalidate: CATALOGUE_TTL });
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 422)) return null;
    throw err;
  }
}
