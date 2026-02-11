'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { RMLine } from '@/types/rm';
import { NWFTH_COLORS } from '@/lib/nwfth-theme';
import { AlertCircle } from 'lucide-react';

/**
 * Props for RMDataTable component
 */
interface RMDataTableProps {
  /** Array of RM lines to display */
  data: RMLine[];

  /** Set of selected row numbers */
  selectedRows: Set<number>;

  /** Callback when selection changes */
  onSelectionChange: (selectedRows: Set<number>) => void;

  /** Whether data is loading */
  isLoading?: boolean;
}

/**
 * Check if a row is selectable based on criteria:
 * ToPickedPartialQty > 0 AND PickedPartialQty <= 0
 */
function isRowSelectable(row: RMLine): boolean {
  return row.ToPickedPartialQty > 0 && row.PickedPartialQty <= 0;
}

/**
 * RM Data Table Component
 * Displays RM lines with checkboxes for selection
 */
export function RMDataTable({
  data,
  selectedRows,
  onSelectionChange,
  isLoading = false,
}: RMDataTableProps) {
  // Calculate selectable rows
  const selectableRows = useMemo(() => {
    return data.filter(isRowSelectable);
  }, [data]);

  // Check if all selectable rows are selected
  const allSelected = useMemo(() => {
    if (selectableRows.length === 0) return false;
    return selectableRows.every((row) => selectedRows.has(row.RowNum));
  }, [selectableRows, selectedRows]);

  // Check if some (but not all) selectable rows are selected
  const someSelected = useMemo(() => {
    if (selectableRows.length === 0) return false;
    const selectedCount = selectableRows.filter((row) =>
      selectedRows.has(row.RowNum)
    ).length;
    return selectedCount > 0 && selectedCount < selectableRows.length;
  }, [selectableRows, selectedRows]);

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all selectable rows
      const newSelected = new Set(selectedRows);
      selectableRows.forEach((row) => newSelected.add(row.RowNum));
      onSelectionChange(newSelected);
    } else {
      // Deselect all rows in current data
      const newSelected = new Set(selectedRows);
      data.forEach((row) => newSelected.delete(row.RowNum));
      onSelectionChange(newSelected);
    }
  };

  // Handle individual row selection
  const handleSelectRow = (row: RMLine, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(row.RowNum);
    } else {
      newSelected.delete(row.RowNum);
    }
    onSelectionChange(newSelected);
  };

  // Format number with 2 decimal places
  const formatNumber = (num: number): string => {
    return num.toFixed(2);
  };

  // Get row status indicator
  const getRowStatus = (row: RMLine): { label: string; color: string } => {
    if (row.ToPickedPartialQty <= 0) {
      return { label: 'No Partial Pick', color: NWFTH_COLORS.textMuted };
    }
    if (row.PickedPartialQty > 0) {
      return { label: 'Already Picked', color: NWFTH_COLORS.accentGold };
    }
    return { label: 'Selectable', color: NWFTH_COLORS.forestGreen };
  };

  if (isLoading) {
    return (
      <div
        className="flex h-64 items-center justify-center rounded-lg border"
        style={{ borderColor: NWFTH_COLORS.border }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: NWFTH_COLORS.forestGreen, borderTopColor: 'transparent' }}
          />
          <span style={{ color: NWFTH_COLORS.textSecondary }}>
            Loading data...
          </span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg border"
        style={{ borderColor: NWFTH_COLORS.border }}
      >
        <AlertCircle
          className="h-10 w-10"
          style={{ color: NWFTH_COLORS.textMuted }}
        />
        <div className="text-center">
          <p
            className="text-base font-medium"
            style={{ color: NWFTH_COLORS.textPrimary }}
          >
            No data found
          </p>
          <p
            className="text-sm"
            style={{ color: NWFTH_COLORS.textSecondary }}
          >
            Enter a RunNo and click Search to load data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border" style={{ borderColor: NWFTH_COLORS.border }}>
      <div className="max-h-[500px] overflow-auto">
        <Table>
          <TableHeader
            className="sticky top-0 z-10"
            style={{ backgroundColor: NWFTH_COLORS.backgroundWarm }}
          >
            <TableRow style={{ borderColor: NWFTH_COLORS.border }}>
              <TableHead className="w-12 px-2">
                <Checkbox
                  checked={allSelected}
                  data-state={someSelected ? 'indeterminate' : allSelected ? 'checked' : 'unchecked'}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all selectable rows"
                />
              </TableHead>
              <TableHead className="text-xs font-semibold" style={{ color: NWFTH_COLORS.textPrimary }}>
                BatchNo
              </TableHead>
              <TableHead className="text-xs font-semibold" style={{ color: NWFTH_COLORS.textPrimary }}>
                Type
              </TableHead>
              <TableHead className="text-xs font-semibold" style={{ color: NWFTH_COLORS.textPrimary }}>
                LineID
              </TableHead>
              <TableHead className="text-xs font-semibold" style={{ color: NWFTH_COLORS.textPrimary }}>
                ItemKey
              </TableHead>
              <TableHead className="text-xs font-semibold" style={{ color: NWFTH_COLORS.textPrimary }}>
                Location
              </TableHead>
              <TableHead className="text-xs font-semibold text-right" style={{ color: NWFTH_COLORS.textPrimary }}>
                Std Qty
              </TableHead>
              <TableHead className="text-xs font-semibold text-right" style={{ color: NWFTH_COLORS.textPrimary }}>
                Pack Size
              </TableHead>
              <TableHead className="text-xs font-semibold text-right" style={{ color: NWFTH_COLORS.textPrimary }}>
                To Pick
              </TableHead>
              <TableHead className="text-xs font-semibold text-right" style={{ color: NWFTH_COLORS.textPrimary }}>
                Picked
              </TableHead>
              <TableHead className="text-xs font-semibold" style={{ color: NWFTH_COLORS.textPrimary }}>
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => {
              const selectable = isRowSelectable(row);
              const status = getRowStatus(row);

              return (
                <TableRow
                  key={row.RowNum}
                  style={{ borderColor: NWFTH_COLORS.borderLight }}
                  className={selectable ? 'nwfth-row-hover hover:bg-[#F5F1EB]' : 'bg-[#FAF8F4]/50'}
                >
                  <TableCell className="px-2">
                    <Checkbox
                      checked={selectedRows.has(row.RowNum)}
                      onCheckedChange={(checked) =>
                        handleSelectRow(row, checked as boolean)
                      }
                      disabled={!selectable}
                      aria-label={`Select row ${row.RowNum}`}
                    />
                  </TableCell>
                  <TableCell
                    className="text-sm font-medium"
                    style={{ color: NWFTH_COLORS.textPrimary }}
                  >
                    {row.BatchNo}
                  </TableCell>
                  <TableCell
                    className="text-sm"
                    style={{ color: NWFTH_COLORS.textSecondary }}
                  >
                    {row.LineTyp}
                  </TableCell>
                  <TableCell
                    className="text-sm"
                    style={{ color: NWFTH_COLORS.textSecondary }}
                  >
                    {row.LineId}
                  </TableCell>
                  <TableCell
                    className="text-sm font-medium"
                    style={{ color: NWFTH_COLORS.textPrimary }}
                  >
                    {row.ItemKey}
                  </TableCell>
                  <TableCell
                    className="text-sm"
                    style={{ color: NWFTH_COLORS.textSecondary }}
                  >
                    {row.Location}
                  </TableCell>
                  <TableCell
                    className="text-sm text-right"
                    style={{ color: NWFTH_COLORS.textSecondary }}
                  >
                    {formatNumber(row.StandardQty)}
                  </TableCell>
                  <TableCell
                    className="text-sm text-right"
                    style={{ color: NWFTH_COLORS.textSecondary }}
                  >
                    {formatNumber(row.PackSize)}
                  </TableCell>
                  <TableCell
                    className="text-sm text-right font-medium"
                    style={{
                      color:
                        row.ToPickedPartialQty > 0
                          ? NWFTH_COLORS.forestGreen
                          : NWFTH_COLORS.textSecondary,
                    }}
                  >
                    {formatNumber(row.ToPickedPartialQty)}
                  </TableCell>
                  <TableCell
                    className="text-sm text-right"
                    style={{
                      color:
                        row.PickedPartialQty > 0
                          ? NWFTH_COLORS.accentGold
                          : NWFTH_COLORS.textSecondary,
                    }}
                  >
                    {formatNumber(row.PickedPartialQty)}
                  </TableCell>
                  <TableCell>
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: `${status.color}15`,
                        color: status.color,
                      }}
                    >
                      {status.label}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Summary Footer */}
      <div
        className="flex items-center justify-between border-t px-4 py-3"
        style={{
          borderColor: NWFTH_COLORS.border,
          backgroundColor: NWFTH_COLORS.backgroundWarm,
        }}
      >
        <div className="flex items-center gap-4">
          <span
            className="text-sm"
            style={{ color: NWFTH_COLORS.textSecondary }}
          >
            Total: <strong style={{ color: NWFTH_COLORS.textPrimary }}>{data.length}</strong> rows
          </span>
          <span
            className="text-sm"
            style={{ color: NWFTH_COLORS.textSecondary }}
          >
            Selectable:{' '}
            <strong style={{ color: NWFTH_COLORS.forestGreen }}>
              {selectableRows.length}
            </strong>{' '}
            rows
          </span>
        </div>
        <span
          className="text-sm"
          style={{ color: NWFTH_COLORS.textSecondary }}
        >
          Selected:{' '}
          <strong style={{ color: NWFTH_COLORS.accentGold }}>
            {selectedRows.size}
          </strong>{' '}
          rows
        </span>
      </div>
    </div>
  );
}
