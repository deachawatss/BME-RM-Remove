/**
 * Raw Material Store - Zustand
 * NWFTH - Northern Wind Food Thailand
 *
 * Manages RM line data state and API interactions
 */

import { create } from 'zustand';
import { RMLine, RMRemoveResponse } from '@/types/rm';
import { searchRM, removeRM, RMApiError } from '@/lib/api/rm';
import { useAuthStore } from './authStore';

/**
 * RM state interface
 */
interface RMState {
  /** Array of RM lines from current search */
  lines: RMLine[];

  /** Set of selected row numbers */
  selectedRows: Set<number>;

  /** Current RunNo being searched */
  currentRunNo: number | null;

  /** Whether data is loading */
  isLoading: boolean;

  /** Error message if any */
  error: string | null;

  /** Whether a search has been performed */
  hasSearched: boolean;
}

/**
 * RM actions interface
 */
interface RMActions {
  /** Search for RM lines by RunNo */
  search: (runno: number) => Promise<void>;

  /** Remove selected rows */
  remove: () => Promise<RMRemoveResponse>;

  /** Set the entire selection set (used by RMDataTable) */
  setSelection: (selectedRows: Set<number>) => void;

  /** Toggle selection of a row */
  toggleSelection: (rowNum: number) => void;

  /** Select all selectable rows */
  selectAll: () => void;

  /** Clear all selections */
  clearSelection: () => void;

  /** Clear error message */
  clearError: () => void;

  /** Reset store to initial state */
  reset: () => void;
}

/**
 * Combined RM store type
 */
type RMStore = RMState & RMActions;

/**
 * Initial state factory
 */
const createInitialState = (): RMState => ({
  lines: [],
  selectedRows: new Set(),
  currentRunNo: null,
  isLoading: false,
  error: null,
  hasSearched: false,
});

/**
 * Check if a row is selectable
 * ToPickedPartialQty > 0 AND PickedPartialQty <= 0
 */
function isRowSelectable(row: RMLine): boolean {
  return row.ToPickedPartialQty > 0 && row.PickedPartialQty <= 0;
}

/**
 * RM Store using Zustand
 */
export const useRMStore = create<RMStore>((set, get) => ({
  // Initial state
  ...createInitialState(),

  // Actions
  search: async (runno: number) => {
    set({
      isLoading: true,
      error: null,
      hasSearched: true,
      selectedRows: new Set(),
      currentRunNo: runno,
    });

    try {
      const lines = await searchRM(runno);
      set({
        lines,
        isLoading: false,
        error: lines.length === 0 ? `No records found for RunNo: ${runno}` : null,
      });
    } catch (error) {
      set({
        lines: [],
        isLoading: false,
        error: error instanceof RMApiError ? error.message : 'Failed to load data',
      });
    }
  },

  remove: async () => {
    const { lines, selectedRows, currentRunNo } = get();

    if (selectedRows.size === 0) {
      throw new Error('No rows selected');
    }

    if (currentRunNo === null) {
      throw new Error('No RunNo selected');
    }

    const user = useAuthStore.getState().user;
    if (!user) {
      throw new Error('Not authenticated');
    }

    set({ isLoading: true, error: null });

    try {
      const rowNums = Array.from(selectedRows);
      const result = await removeRM(currentRunNo, rowNums, user.username);

      // Remove the processed rows from local state
      set((state) => ({
        lines: state.lines.filter((line) => !selectedRows.has(line.RowNum)),
        selectedRows: new Set(),
        isLoading: false,
      }));

      return result;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof RMApiError ? error.message : 'Failed to remove records',
      });
      throw error;
    }
  },

  setSelection: (selectedRows: Set<number>) => {
    set({ selectedRows });
  },

  toggleSelection: (rowNum: number) => {
    set((state) => {
      const newSelected = new Set(state.selectedRows);
      if (newSelected.has(rowNum)) {
        newSelected.delete(rowNum);
      } else {
        newSelected.add(rowNum);
      }
      return { selectedRows: newSelected };
    });
  },

  selectAll: () => {
    set((state) => {
      const selectableRowNums = state.lines
        .filter(isRowSelectable)
        .map((line) => line.RowNum);
      return { selectedRows: new Set(selectableRowNums) };
    });
  },

  clearSelection: () => {
    set({ selectedRows: new Set() });
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set(createInitialState());
  },
}));

/**
 * Hook to get selectable rows count
 */
export function useSelectableCount(): number {
  const { lines } = useRMStore();
  return lines.filter(isRowSelectable).length;
}

/**
 * Hook to check if a specific row is selected
 */
export function useIsRowSelected(rowNum: number): boolean {
  const { selectedRows } = useRMStore();
  return selectedRows.has(rowNum);
}
