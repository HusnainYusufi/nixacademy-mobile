/**
 * Typed API client for the Nix Academy backend, tuned for the Capacitor app.
 *
 * - Access token is held in memory (attached as Bearer) and mirrored into
 *   Capacitor Preferences so a warm start can restore the session.
 * - The resolved tenant id + language are kept in a module store and attached
 *   to every request (x-tenant-id / x-lang) — the app is one workspace per
 *   session, so callers don't thread them through.
 * - The refresh token is an httpOnly cookie the WebView replays automatically
 *   (credentials: 'include'); a 401 triggers one transparent refresh + replay.
 * - Success bodies are unwrapped from the backend's { data } envelope; failures
 *   surface as ApiError carrying problem+json fields.
 */
import { Preferences } from '@capacitor/preferences';

const BASE: string =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'https://api.nixacademy.io/api/v1';

export const apiBaseUrl = BASE;

const TOKEN_KEY = 'nixacademy.accessToken';

let accessToken: string | null = null;
let tenantId: string | null = null;
let lang = 'ar';

export const session = {
  setToken(t: string | null) {
    accessToken = t;
    void (t
      ? Preferences.set({ key: TOKEN_KEY, value: t })
      : Preferences.remove({ key: TOKEN_KEY }));
  },
  getToken: () => accessToken,
  async restoreToken() {
    const { value } = await Preferences.get({ key: TOKEN_KEY });
    accessToken = value ?? null;
    return accessToken;
  },
  setTenant(id: string | null) {
    tenantId = id;
  },
  getTenant: () => tenantId,
  setLang(l: string) {
    lang = l;
  },
};

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Override the ambient tenant id (rarely needed). */
  tenantId?: string | null;
  noRetry?: boolean;
  signal?: AbortSignal;
}

async function raw<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const tid = opts.tenantId ?? tenantId;
  if (tid) headers['x-tenant-id'] = tid;
  headers['x-lang'] = lang;

  const res = await fetch(`${BASE}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    credentials: 'include',
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });

  if (res.status === 204) return undefined as T;
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      res.status,
      payload.code ?? 'ERROR',
      payload.title ?? payload.message ?? 'Request failed',
      payload.details,
    );
  }
  return (payload.data ?? payload) as T;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  try {
    return await raw<T>(path, opts);
  } catch (err) {
    if (
      err instanceof ApiError &&
      err.status === 401 &&
      !opts.noRetry &&
      path !== '/auth/refresh'
    ) {
      const ok = await tryRefresh();
      if (ok) return raw<T>(path, { ...opts, noRetry: true });
    }
    throw err;
  }
}

export async function tryRefresh(): Promise<boolean> {
  try {
    const res = await raw<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      noRetry: true,
    });
    session.setToken(res.accessToken);
    return true;
  } catch {
    session.setToken(null);
    return false;
  }
}

export const api = {
  get: <T>(path: string, o?: RequestOptions) => request<T>(path, { ...o, method: 'GET' }),
  post: <T>(path: string, body?: unknown, o?: RequestOptions) =>
    request<T>(path, { ...o, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, o?: RequestOptions) =>
    request<T>(path, { ...o, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, o?: RequestOptions) =>
    request<T>(path, { ...o, method: 'PUT', body }),
  del: <T>(path: string, o?: RequestOptions) => request<T>(path, { ...o, method: 'DELETE' }),
};

/** Turn a stored file key into a usable URL. Backend-served files live under the
 *  API base (e.g. `/api/v1/course-thumbnails/…`); already-absolute URLs pass
 *  through. In dev the relative base routes the image through the Vite proxy. */
export function fileUrl(key?: string | null): string {
  if (!key) return '';
  if (/^https?:\/\//.test(key)) return key;
  return `${BASE}${key.startsWith('/') ? key : `/${key}`}`;
}
