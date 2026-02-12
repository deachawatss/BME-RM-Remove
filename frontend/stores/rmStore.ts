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

  /** Set of selected row composite keys (RowNum-LineId) */
  selectedRows: Set<string>;

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
  setSelection: (selectedRows: Set<string>) => void;

  /** Toggle selection of a row */
  toggleSelection: (rowNum: number, lineId: number) => void;

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
  return row.ToPickedPartialQty > 0 && (row.PickedPartialQty === null || row.PickedPartialQty <= 0);
}

/**
 * Helper to generate composite key
 */
function getRowKey(rowNum: number, lineId: number): string {
  return `${rowNum}-${lineId}`;
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
      // Convert selected keys back to items
      const itemsToRemove = Array.from(selectedRows).map(key => {
        const [rowNumStr, lineIdStr] = key.split('-');
        return {
          rowNum: parseInt(rowNumStr, 10),
          lineId: parseInt(lineIdStr, 10)
        };
      });

      const result = await removeRM(currentRunNo, itemsToRemove, user.username);

      // Remove the processed rows from local state
      set((state) => ({
        lines: state.lines.filter((line) => !selectedRows.has(getRowKey(line.RowNum, line.LineId))),
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

  setSelection: (selectedRows: Set<string>) => {
    set({ selectedRows });
  },

  toggleSelection: (rowNum: number, lineId: number) => {
    const key = getRowKey(rowNum, lineId);
    set((state) => {
      const newSelected = new Set(state.selectedRows);
      if (newSelected.has(key)) {
        newSelected.delete(key);
      } else {
        newSelected.add(key);
      }
      return { selectedRows: newSelected };
    });
  },

  selectAll: () => {
    set((state) => {
      const selectableKeys = state.lines
        .filter(isRowSelectable)
        .map((line) => getRowKey(line.RowNum, line.LineId));
      return { selectedRows: new Set(selectableKeys) };
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
export function useIsRowSelected(rowNum: number, lineId: number): boolean {
  const { selectedRows } = useRMStore();
  return selectedRows.has(getRowKey(rowNum, lineId));
}
