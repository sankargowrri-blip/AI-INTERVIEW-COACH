import axios from 'axios';
import type { User, LoginCredentials, RegisterData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const AUTH_STORAGE_KEY = 'aic_auth_user';
const TOKEN_KEY = 'aic_auth_token';

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const params = new URLSearchParams();
      params.append('username', credentials.email);
      params.append('password', credentials.password);

      const response = await axios.post(`${API_URL}/auth/login`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = response.data;
      localStorage.setItem(TOKEN_KEY, access_token);

      // Get user profile after login
      const userResponse = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const user = userResponse.data;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

      return { success: true, user };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Invalid email or password.',
      };
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email: data.email,
        password: data.password,
        full_name: data.name,
      });

      const { user, access_token } = response.data;

      if (access_token) {
        localStorage.setItem(TOKEN_KEY, access_token);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      }

      return { success: true, user };
    } catch (error: any) {
      console.error('Registration Error:', error);
      const detail = error.response?.data?.detail;
      const message = typeof detail === 'string' ? detail :
                      (Array.isArray(detail) ? detail[0]?.msg : null);

      return {
        success: false,
        error: message || 'Registration failed. Please check your internet connection and try again.',
      };
    }
  },

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  },

  async updateUser(updates: Partial<User>): Promise<User | null> {
    try {
      const token = this.getToken();
      const response = await axios.patch(`${API_URL}/users/me`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = response.data;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return null;
    }
  },
};
