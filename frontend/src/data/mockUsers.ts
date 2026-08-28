import type { User } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    experienceLevel: 'fresher',
    preferredRole: 'Data Analyst',
    createdAt: '2026-01-15T10:00:00Z',
  },
];

// Mock credential store for demo login
export const mockCredentials: Record<string, { password: string; userId: string }> = {
  'alex@example.com': { password: 'password123', userId: 'user-1' },
};

export const defaultUser: User = mockUsers[0];
