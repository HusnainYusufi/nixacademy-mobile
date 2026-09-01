import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Preferences } from '@capacitor/preferences';
import { api, session } from './api';

export interface AuthUser {
  userId: string;
  tenantId: string;
  membershipId: string;
  roles: string[];
  locale?: string;
  email?: string;
  name?: string;
}

export interface Workspace {
  tenantId: string;
  slug: string;
  name: string;
}

interface AuthState {
  user: AuthUser | null;
  workspace: Workspace | null;
  /** Booting: restoring a persisted session. */
  loading: boolean;
  /** Slug remembered from the last login, to pre-fill the form. */
  lastSlug: string | null;
  login: (slug: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isOwner: boolean;
}

const OWNER_ROLES = new Set(['TENANT_OWNER', 'ADMIN', 'PLATFORM_ADMIN', 'STAFF']);
const WS_KEY = 'nixacademy.workspace';
const SLUG_KEY = 'nixacademy.lastSlug';

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSlug, setLastSlug] = useState<string | null>(null);
  const booted = useRef(false);

  // Warm start: restore token + tenant, then refresh to validate and fetch user.
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    (async () => {
      try {
        const [{ value: wsRaw }, { value: slug }] = await Promise.all([
          Preferences.get({ key: WS_KEY }),
          Preferences.get({ key: SLUG_KEY }),
        ]);
        if (slug) setLastSlug(slug);
        await session.restoreToken();
        const ws = wsRaw ? (JSON.parse(wsRaw) as Workspace) : null;
        if (ws) {
          session.setTenant(ws.tenantId);
          setWorkspace(ws);
          try {
            const res = await api.post<{ accessToken: string; user: AuthUser }>(
              '/auth/refresh',
              undefined,
              { noRetry: true },
            );
            session.setToken(res.accessToken);
            setUser(res.user);
          } catch {
            session.setToken(null);
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (slug: string, email: string, password: string) => {
    const s = slug.trim().toLowerCase();
    const ws = await api.get<{ tenantId: string; name: string; slug: string }>(
      `/onboarding/lookup?slug=${encodeURIComponent(s)}`,
    );
    session.setTenant(ws.tenantId);
    const res = await api.post<{ accessToken: string; user: AuthUser }>('/auth/login', {
      email: email.trim(),
      password,
    });
    session.setToken(res.accessToken);
    const workspaceObj: Workspace = { tenantId: ws.tenantId, slug: ws.slug, name: ws.name };
    setWorkspace(workspaceObj);
    setUser(res.user);
    setLastSlug(ws.slug);
    await Promise.all([
      Preferences.set({ key: WS_KEY, value: JSON.stringify(workspaceObj) }),
      Preferences.set({ key: SLUG_KEY, value: ws.slug }),
    ]);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* best effort */
    }
    session.setToken(null);
    setUser(null);
    // Keep workspace + slug so the next login is one tap.
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      workspace,
      loading,
      lastSlug,
      login,
      logout,
      isOwner: !!user?.roles?.some((r) => OWNER_ROLES.has(r)),
    }),
    [user, workspace, loading, lastSlug, login, logout],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
