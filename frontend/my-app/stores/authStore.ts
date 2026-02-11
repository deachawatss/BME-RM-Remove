/**
 * Authentication Store - Zustand
 * NWFTH - Northern Wind Food Thailand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * User type representing authenticated user
 */
export interface User {
  /** Username/login ID */
  username: string;

  /** Display name */
  displayName: string;

  /** Email address */
  email: string;

  /** Department */
  department: string;

  /** User roles */
  roles: string[];
}

/**
 * Authentication state interface
 */
interface AuthState {
  /** Current user or null if not authenticated */
  user: User | null;

  /** Authentication token */
  token: string | null;

  /** Whether user is authenticated */
  isAuthenticated: boolean;

  /** Loading state for auth operations */
  isLoading: boolean;

  /** Error message */
  error: string | null;
}

/**
 * Authentication actions interface
 */
interface AuthActions {
  /** Login with credentials */
  login: (username: string, password: string) => Promise<boolean>;

  /** Logout current user */
  logout: () => void;

  /** Clear error message */
  clearError: () => void;

  /** Set user (for session restore) */
  setUser: (user: User, token: string) => void;
}

/**
 * Combined auth store type
 */
type AuthStore = AuthState & AuthActions;

/**
 * Real LDAP/SQL authentication via Rust backend API
 */
async function authenticateWithBackend(
  username: string,
  password: string
): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || `Authentication failed (${response.status})`,
      };
    }

    if (!data.success) {
      return {
        success: false,
        error: data.message || data.error || 'Authentication failed',
      };
    }

    // Map backend user response to our User type
    const user: User = {
      username: data.user?.username || username.toLowerCase(),
      displayName: data.user?.display_name || username,
      email: data.user?.email || `${username.toLowerCase()}@nwfth.com`,
      department: data.user?.department || 'Production',
      roles: data.user?.roles || ['rm_operator', 'viewer'],
    };

    return {
      success: true,
      user,
      token: data.token,
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Unable to connect to server. Please check your connection.',
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

/**
 * Authentication store using Zustand
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const result = await authenticateWithBackend(username, password);

          if (result.success && result.user && result.token) {
            set({
              user: result.user,
              token: result.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: result.error || 'Authentication failed',
            });
            return false;
          }
        } catch (err) {
          set({
            isLoading: false,
            error: 'Network error. Please try again.',
          });
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      setUser: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'nwfth-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Hook to check if user has specific role
 */
export function useHasRole(role: string): boolean {
  const { user } = useAuthStore();
  return user?.roles.includes(role) ?? false;
}

/**
 * Hook to get current username
 */
export function useCurrentUsername(): string | null {
  const { user } = useAuthStore();
  return user?.username ?? null;
}
