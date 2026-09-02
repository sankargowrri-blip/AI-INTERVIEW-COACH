/**
 * authService.ts
 *
 * Login makes ONE network request (backend returns token + user together).
 * Timeout is 75 s — long enough for Render free-tier cold start (~60 s).
 * One automatic retry on timeout / network error with a 3 s delay.
 * Error messages are categorised so the UI can show the right hint.
 */

import axios from 'axios';
import type { User, LoginCredentials, RegisterData } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const API_URL  = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

/**
 * Primary timeout for a single attempt.
 * Render free cold-start takes up to ~60 s; we give 75 s before giving up.
 */
const TIMEOUT_MS  = 75_000;
const RETRY_DELAY = 3_000;   // ms to wait before the automatic retry

const AUTH_STORAGE_KEY = 'aic_auth_user';
const TOKEN_KEY        = 'aic_auth_token';

// ── Error categories ───────────────────────────────────────────────────────
export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'SERVER_ERROR'
  | 'UNKNOWN';

export interface AuthResponse {
  success:    boolean;
  user?:      User;
  error?:     string;
  errorCode?: AuthErrorCode;
}

// ── helpers ────────────────────────────────────────────────────────────────

const mapUser = (data: any): User => ({
  id:              String(data.id),
  name:            data.full_name || data.name || 'User',
  email:           data.email,
  experienceLevel: data.experience_level,
  preferredRole:   data.target_role || data.preferredRole,
  createdAt:       data.created_at || new Date().toISOString(),
});

function persistUser(user: User, token: string) {
  try {
    localStorage.setItem(TOKEN_KEY,        token);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } catch { /* storage full or private mode — fail silently */ }
}

function sleep(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms));
}

/** Parse an axios error into a code + message pair. */
function parseError(error: any): { code: AuthErrorCode; message: string } {
  // No response at all — network layer problem
  if (!error.response) {
    const isTimeout =
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK' ||
      error.message?.toLowerCase().includes('timeout') ||
      error.message?.toLowerCase().includes('network');

    if (isTimeout) {
      return {
        code:    'TIMEOUT',
        message: 'timeout', // sentinel — LoginPage replaces with friendly copy
      };
    }
    return {
      code:    'NETWORK_ERROR',
      message:
        'Unable to reach the server. Please check your connection and try again.',
    };
  }

  // Server responded with an error
  const status = error.response.status;
  const detail = error.response?.data?.detail;
  const detailMsg =
    typeof detail === 'string'
      ? detail
      : Array.isArray(detail)
      ? detail[0]?.msg || 'Validation error.'
      : null;

  if (status === 401 || status === 403) {
    return {
      code:    'INVALID_CREDENTIALS',
      message: 'Invalid email or password.',
    };
  }
  if (status === 422) {
    return {
      code:    'INVALID_CREDENTIALS',
      message: detailMsg || 'Please check your email and password.',
    };
  }
  if (status >= 500) {
    return {
      code:    'SERVER_ERROR',
      message:
        detailMsg ||
        'The server encountered an error. Please try again in a moment.',
    };
  }
  return {
    code:    'UNKNOWN',
    message: detailMsg || `Request failed (HTTP ${status}).`,
  };
}

/** Make ONE login attempt. Returns the axios response or throws. */
async function attemptLogin(params: URLSearchParams) {
  return axios.post(`${API_URL}/auth/login`, params, {
    headers:             { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout:             TIMEOUT_MS,
    timeoutErrorMessage: 'timeout',
  });
}

// ── public service ─────────────────────────────────────────────────────────

export const authService = {

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const params = new URLSearchParams();
    params.append('username', credentials.email);
    params.append('password', credentials.password);

    console.log('[AUTH] login → POST', `${API_URL}/auth/login`);
    const t0 = Date.now();

    // ── Attempt 1 ───────────────────────────────────────────────────────
    let lastError: any = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        if (attempt === 2) {
          console.log('[AUTH] retrying after', RETRY_DELAY, 'ms…');
          await sleep(RETRY_DELAY);
        }

        const response = await attemptLogin(params);
        const { access_token, user: rawUser } = response.data;
        console.log(`[AUTH] login OK in ${Date.now() - t0} ms (attempt ${attempt})`);

        let user: User;
        if (rawUser) {
          user = mapUser(rawUser);
        } else {
          // Backwards compat: old backend returns token only
          console.log('[AUTH] fallback GET /users/me');
          const profileRes = await axios.get(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${access_token}` },
            timeout: 15_000,
          });
          user = mapUser(profileRes.data);
        }

        persistUser(user, access_token);
        return { success: true, user };

      } catch (err: any) {
        lastError = err;
        const { code } = parseError(err);

        // Don't retry on wrong credentials — it will fail again immediately
        if (code === 'INVALID_CREDENTIALS') break;

        // Don't retry if we already used both attempts
        if (attempt === 2) break;

        console.warn(`[AUTH] attempt ${attempt} failed (${code}), will retry`);
      }
    }

    // Both attempts exhausted
    const { code, message } = parseError(lastError);
    console.error('[AUTH] login failed after retries:', code, message);
    return {
      success:   false,
      error:     message,
      errorCode: code,
    };
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    console.log('[AUTH] register → POST', `${API_URL}/auth/register`);
    const t0 = Date.now();
    try {
      const response = await axios.post(
        `${API_URL}/auth/register`,
        { email: data.email, password: data.password, full_name: data.name },
        { timeout: TIMEOUT_MS, timeoutErrorMessage: 'timeout' },
      );

      const { user: rawUser, access_token } = response.data;
      console.log(`[AUTH] register OK in ${Date.now() - t0} ms`);

      if (!rawUser || !access_token) {
        return {
          success: false,
          error:
            'Registration succeeded but the server returned incomplete data. Please log in.',
          errorCode: 'SERVER_ERROR',
        };
      }

      const user = mapUser(rawUser);
      persistUser(user, access_token);
      return { success: true, user };

    } catch (error: any) {
      const { code, message } = parseError(error);
      console.error('[AUTH] register failed:', code, message);
      return { success: false, error: message, errorCode: code };
    }
  },

  logout(): void {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch { /* ignore */ }
  },

  /** Synchronous — reads from localStorage, no network call. */
  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as User) : null;
    } catch { return null; }
  },

  getToken(): string | null {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  },

  async updateUser(updates: Partial<User>): Promise<User | null> {
    try {
      const token    = this.getToken();
      const response = await axios.patch(`${API_URL}/users/me`, updates, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15_000,
      });
      const updated = mapUser(response.data);
      try { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    } catch { return null; }
  },
};
