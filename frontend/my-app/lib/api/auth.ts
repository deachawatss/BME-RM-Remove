/**
 * Authentication API Client
 * NWFTH - Northern Wind Food Thailand
 *
 * Connects to Rust backend for LDAP/SQL authentication
 */

import { User } from '@/stores/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * Login response from backend
 */
interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

/**
 * Login credentials
 */
interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Authentication error class
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Login with username and password
 * Calls the Rust backend LDAP/SQL authentication endpoint
 *
 * @param credentials - Username and password
 * @returns Login response with token and user data
 * @throws AuthError if authentication fails
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data: LoginResponse = await response.json();

    if (!response.ok) {
      throw new AuthError(
        data.error || `Authentication failed (${response.status})`,
        response.status
      );
    }

    if (!data.success) {
      throw new AuthError(data.error || 'Authentication failed');
    }

    return data;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }

    // Network or other errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new AuthError('Unable to connect to server. Please check your connection.');
    }

    throw new AuthError('An unexpected error occurred. Please try again.');
  }
}

/**
 * Get the stored JWT token from localStorage
 * This is called by other API functions to include the token in requests
 *
 * @returns The JWT token or null if not authenticated
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const authStorage = localStorage.getItem('nwfth-auth-storage');
    if (!authStorage) return null;

    const parsed = JSON.parse(authStorage);
    return parsed.state?.token || null;
  } catch {
    return null;
  }
}

/**
 * Verify if the current token is still valid
 * Optional: Can be used to check token validity on app load
 *
 * @returns True if token exists and appears valid
 */
export function hasValidToken(): boolean {
  const token = getToken();
  if (!token) return false;

  // Basic JWT structure check (header.payload.signature)
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  return true;
}
