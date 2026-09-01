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

/** The academy the account resolved to (returned by login/refresh). */
export interface Workspace {
  tenantId: string;
  slug: string;
  name: string;
}

/** Shape of /auth/login and /auth/refresh responses. */
interface SessionResponse {
  accessToken: string;
  user: AuthUser;
  tenant: { id: string; slug: string; name: string };
}

interface AuthState {
  user: AuthUser | null;
  workspace: Workspace | null;
  loading: boolean;
  /** Email remembered from the last login, to pre-fill the form. */
  lastEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isOwner: boolean;
}

const OWNER_ROLES = new Set(['TENANT_OWNER', 'ADMIN', 'PLATFORM_ADMIN', 'STAFF']);
const WS_KEY = 'nixacademy.workspace';
const EMAIL_KEY = 'nixacademy.lastEmail';

const Ctx = createContext<AuthState | null>(null);

function applySession(
  res: SessionResponse,
  set: {
    setUser: (u: AuthUser) => void;
    setWorkspace: (w: Workspace) => void;
  },
) {
  const ws: Workspace = { tenantId: res.tenant.id, slug: res.tenant.slug, name: res.tenant.name };
  session.setToken(res.accessToken);
  session.setTenant(res.user.tenantId);
  set.setWorkspace(ws);
  set.setUser(res.user);
  void Preferences.set({ key: WS_KEY, value: JSON.stringify(ws) });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastEmail, setLastEmail] = useState<string | null>(null);
  const booted = useRef(false);

  // Warm start: refresh resolves the academy from the account (no tenant needed).
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    (async () => {
      try {
        const [{ value: wsRaw }, { value: email }] = await Promise.all([
          Preferences.get({ key: WS_KEY }),
          Preferences.get({ key: EMAIL_KEY }),
        ]);
        if (email) setLastEmail(email);
        // Show the cached academy immediately for a smoother splash→app.
        if (wsRaw) {
          try {
            const ws = JSON.parse(wsRaw) as Workspace;
            setWorkspace(ws);
            session.setTenant(ws.tenantId);
          } catch {
            /* ignore corrupt cache */
          }
        }
        await session.restoreToken();
        try {
          const res = await api.post<SessionResponse>('/auth/refresh', undefined, {
            noRetry: true,
          });
          applySession(res, { setUser, setWorkspace });
        } catch {
          session.setToken(null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<SessionResponse>('/auth/login', {
      email: email.trim(),
      password,
    });
    applySession(res, { setUser, setWorkspace });
    setLastEmail(email.trim());
    void Preferences.set({ key: EMAIL_KEY, value: email.trim() });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* best effort */
    }
    session.setToken(null);
    session.setTenant(null);
    setUser(null);
    // Keep workspace + email so the next login is one tap.
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      workspace,
      loading,
      lastEmail,
      login,
      logout,
      isOwner: !!user?.roles?.some((r) => OWNER_ROLES.has(r)),
    }),
    [user, workspace, loading, lastEmail, login, logout],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
