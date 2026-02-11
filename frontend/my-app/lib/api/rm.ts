/**
 * Raw Material API Client
 * NWFTH - Northern Wind Food Thailand
 *
 * Connects to Rust backend for RM partial picking operations
 */

import { RMLine, RMRemoveResponse } from '@/types/rm';
import { getToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * RM API error class
 */
export class RMApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly details?: string
  ) {
    super(message);
    this.name = 'RMApiError';
  }
}

/**
 * Search response from backend
 */
interface SearchRMResponse {
  success: boolean;
  data?: RMLine[];
  error?: string;
}

/**
 * Remove request payload
 */
interface RemoveRMRequest {
  run_no: number;
  row_nums: number[];
  user_logon: string;
}

/**
 * Remove response from backend
 */
interface RemoveRMBackendResponse {
  success: boolean;
  affected_count?: number;
  error?: string;
  details?: string;
}

/**
 * Get authorization headers with JWT token
 */
function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) {
    throw new RMApiError('Not authenticated. Please log in.');
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * Search RM lines by RunNo
 *
 * @param runno - The RunNo to search for
 * @returns Array of RM lines
 * @throws RMApiError if search fails or not authenticated
 */
export async function searchRM(runno: number): Promise<RMLine[]> {
  try {
    const headers = getAuthHeaders();

    const response = await fetch(
      `${API_URL}/api/rm/search?runno=${encodeURIComponent(runno)}`,
      {
        method: 'GET',
        headers,
      }
    );

    const data: SearchRMResponse = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new RMApiError('Session expired. Please log in again.', 401);
      }
      throw new RMApiError(
        data.error || `Search failed (${response.status})`,
        response.status
      );
    }

    if (!data.success) {
      throw new RMApiError(data.error || 'Search failed');
    }

    return data.data || [];
  } catch (error) {
    if (error instanceof RMApiError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new RMApiError('Unable to connect to server. Please check your connection.');
    }

    throw new RMApiError('An unexpected error occurred while searching.');
  }
}

/**
 * Remove partial picking entries for selected rows
 *
 * @param runNo - The RunNo being processed
 * @param rowNums - Array of row numbers to remove
 * @param userLogon - Username of the operator performing the removal
 * @returns Remove response with affected count
 * @throws RMApiError if removal fails or not authenticated
 */
export async function removeRM(
  runNo: number,
  rowNums: number[],
  userLogon: string
): Promise<RMRemoveResponse> {
  try {
    const headers = getAuthHeaders();

    const payload: RemoveRMRequest = {
      run_no: runNo,
      row_nums: rowNums,
      user_logon: userLogon,
    };

    const response = await fetch(`${API_URL}/api/rm/remove`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data: RemoveRMBackendResponse = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new RMApiError('Session expired. Please log in again.', 401);
      }
      throw new RMApiError(
        data.error || `Remove operation failed (${response.status})`,
        response.status,
        data.details
      );
    }

    if (!data.success) {
      throw new RMApiError(data.error || 'Remove operation failed', undefined, data.details);
    }

    return {
      success: true,
      affectedCount: data.affected_count || rowNums.length,
    };
  } catch (error) {
    if (error instanceof RMApiError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new RMApiError('Unable to connect to server. Please check your connection.');
    }

    throw new RMApiError('An unexpected error occurred while removing records.');
  }
}
