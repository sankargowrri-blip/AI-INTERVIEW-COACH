/**
 * authService.ts
 *
 * Performance optimisation applied:
 *  - login() now makes ONE request instead of two.
 *    The backend /login endpoint returns the user alongside the token,
 *    so we no longer need a second GET /users/me round trip.
 *  - All API calls use a 15-second timeout so the UI never hangs forever.
 *  - User data is cached in localStorage and restored on page load,
 *    so AuthContext becomes synchronous (no async useEffect waterfall).
 */

import axios from 'axios';
import type { User, LoginCredentials, RegisterData } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const API_URL  = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

/** Request timeout — 15 s. Enough for a warm Render backend; surfaces cold-start clearly. */
const TIMEOUT_MS = 15_000;

const AUTH_STORAGE_KEY = 'aic_auth_user';
const TOKEN_KEY        = 'aic_auth_token';

// ── helpers ───────────────────────────────────────────────────────────────────

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
  } catch { /* storage full / private mode */ }
}

function errorMessage(error: any): string {
  if (!error.response && !error.request) return error.message || 'An unexpected error occurred.';
  if (!error.response) {
    // Request made but no response — network error OR timeout
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'timeout';
    }
    return 'Unable to connect to the server. The backend may be starting up — please wait a moment and try again.';
  }
  const detail = error.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail))    return detail[0]?.msg || 'Validation error.';
  return `Error ${error.response.status}: ${error.response.statusText || 'Request failed.'}`;
}

// ── service ───────────────────────────────────────────────────────────────────

export interface AuthResponse {
  success: boolean;
  user?:   User;
  error?:  string;
}

export const authService = {

  /**
   * Log in with email + password.
   *
   * Makes exactly ONE network request.
   * The updated backend /login endpoint now returns both the token and the
   * user object, so we never need a second GET /users/me.
   *
   * If the backend still returns only a token (old version), we fall back to
   * a second GET /users/me call for backwards compatibility.
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const params = new URLSearchParams();
    params.append('username', credentials.email);
    params.append('password', credentials.password);

    console.log('[AUTH] login → POST', `${API_URL}/auth/login`);
    const t0 = Date.now();

    try {
      const response = await axios.post(`${API_URL}/auth/login`, params, {
        headers:        { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout:        TIMEOUT_MS,
        timeoutErrorMessage: 'timeout',
      });

      const { access_token, user: rawUser } = response.data;
      console.log(`[AUTH] login response: ${Date.now() - t0} ms`);

      let user: User;

      if (rawUser) {
        // ── Fast path: backend returned user in login response ──────────────
        user = mapUser(rawUser);
        console.log('[AUTH] user from login response — no second request needed');
      } else {
        // ── Fallback: old backend — fetch profile separately ────────────────
        console.log('[AUTH] fallback: GET /users/me');
        const profileRes = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${access_token}` },
          timeout: TIMEOUT_MS,
        });
        user = mapUser(profileRes.data);
        console.log(`[AUTH] /users/me response: ${Date.now() - t0} ms total`);
      }

      persistUser(user, access_token);
      return { success: true, user };

    } catch (error: any) {
      console.error('[AUTH] login error:', error?.response?.status, error?.message);
      const msg = errorMessage(error);
      return {
        success: false,
        error:   msg === 'timeout'
          ? 'Login is taking longer than expected. The server may be starting up — please wait a moment and try again.'
          : msg,
      };
    }
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
      console.log(`[AUTH] register response: ${Date.now() - t0} ms`);

      if (!rawUser || !access_token) {
        return { success: false, error: 'Registration succeeded but the server returned incomplete data. Please log in.' };
      }

      const user = mapUser(rawUser);
      persistUser(user, access_token);
      return { success: true, user };

    } catch (error: any) {
      console.error('[AUTH] register error:', error?.response?.status, error?.message);
      const msg = errorMessage(error);
      return {
        success: false,
        error: msg === 'timeout'
          ? 'Registration is taking longer than expected. Please try again.'
          : msg,
      };
    }
  },

  logout(): void {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch { /* ignore */ }
  },

  /**
   * Restore user from localStorage — synchronous, no network call.
   * Called by AuthContext on mount to set initial state instantly.
   */
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
        timeout: TIMEOUT_MS,
      });
      const updated = mapUser(response.data);
      try { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    } catch { return null; }
  },
};
