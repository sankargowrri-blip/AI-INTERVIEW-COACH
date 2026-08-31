import axios from 'axios';
import type { User, LoginCredentials, RegisterData } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
// Ensure no trailing slash
const API_URL = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

const AUTH_STORAGE_KEY = 'aic_auth_user';
const TOKEN_KEY = 'aic_auth_token';

// Helper to map backend user to frontend user
const mapUser = (data: any): User => {
  return {
    id: data.id.toString(),
    name: data.full_name || data.name || 'User',
    email: data.email,
    experienceLevel: data.experience_level,
    preferredRole: data.target_role || data.preferredRole,
    createdAt: data.created_at || new Date().toISOString(),
  };
};

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Attempting login to:', `${API_URL}/auth/login`);
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

      const user = mapUser(userResponse.data);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

      return { success: true, user };
    } catch (error: any) {
      console.error('Login Error Full Details:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Invalid email or password.',
      };
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('Attempting registration to:', `${API_URL}/auth/register`);
      const response = await axios.post(`${API_URL}/auth/register`, {
        email: data.email,
        password: data.password,
        full_name: data.name,
      });

      const { user: rawUser, access_token } = response.data;
      const user = mapUser(rawUser);

      if (access_token) {
        localStorage.setItem(TOKEN_KEY, access_token);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      }

      return { success: true, user };
    } catch (error: any) {
      console.error('Registration Error Full Details:', error);

      let message = 'Registration failed.';

      if (error.response) {
        // The server responded with a status code outside the 2xx range
        const detail = error.response.data?.detail;
        if (typeof detail === 'string') {
          message = detail;
        } else if (Array.isArray(detail)) {
          message = detail[0]?.msg || message;
        } else if (error.response.status === 500) {
          message = 'Server Error (500). Please check backend logs.';
        } else {
          message = `Error ${error.response.status}: ${message}`;
        }
      } else if (error.request) {
        // The request was made but no response was received
        message = 'Unable to connect to the server. Please check your internet or backend status.';
      } else {
        // Something happened in setting up the request
        message = error.message;
      }

      return {
        success: false,
        error: message,
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
      const updated = mapUser(response.data);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return null;
    }
  },
};
