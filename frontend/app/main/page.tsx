'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useRMStore } from '@/stores/rmStore';
import { Header } from '@/components/Header';
import { RunNoInput } from '@/components/RunNoInput';
import { RMDataTable } from '@/components/RMDataTable';
import { RemoveButton } from '@/components/RemoveButton';
import { NWFTH_COLORS } from '@/lib/nwfth-theme';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Info } from 'lucide-react';
import { toast } from '@/components/ui/toast';

/**
 * Dashboard Page
 * Main interface for RM Partial Picking Remover
 */
export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  // RM Store state and actions
  const {
    lines,
    selectedRows,
    isLoading,
    error,
    hasSearched,
    currentRunNo,
    search,
    remove,
    setSelection,
    selectAll,
    clearSelection,
    reset,
  } = useRMStore();

  // Local state for RunNo input
  const [runNo, setRunNo] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Show error toast when error changes
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle search
  const handleSearch = async (searchRunNo: number) => {
    await search(searchRunNo);
    // Check results after search
    const store = useRMStore.getState();
    if (store.lines.length > 0) {
      toast.success(`Found ${store.lines.length} records for RunNo ${searchRunNo}`);
    }
  };

  // Handle clear - reset to initial search state
  const handleClear = () => {
    setRunNo('');
    reset();
  };

  // Handle remove
  const handleRemove = async () => {
    try {
      const result = await remove();
      if (result.success) {
        toast.success(`Successfully removed ${result.affectedCount} record(s)`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove records');
      throw err;
    }
  };

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      className="nwfth-fade-in flex min-h-screen flex-col"
      style={{ backgroundColor: NWFTH_COLORS.background }}
    >
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* Initial State - Search Input (before first search) */}
          {!hasSearched && (
            <Card
              className="nwfth-fade-in"
              style={{ borderColor: NWFTH_COLORS.border }}
            >
              <CardHeader
                className="border-b pb-4"
                style={{ backgroundColor: NWFTH_COLORS.backgroundWarm }}
              >
                <CardTitle
                  className="text-lg flex items-center gap-2 mb-4"
                  style={{ color: NWFTH_COLORS.textPrimary }}
                >
                  <Package className="h-5 w-5" />
                  Search Run
                </CardTitle>
                <div className="w-full sm:w-96">
                  <RunNoInput
                    value={runNo}
                    onChange={setRunNo}
                    onSearch={handleSearch}
                    onClear={handleClear}
                    isLoading={isLoading}
                    error={error}
                  />
                </div>
              </CardHeader>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                  <Info
                    className="h-10 w-10"
                    style={{ color: NWFTH_COLORS.textMuted }}
                  />
                  <p
                    className="text-base font-medium"
                    style={{ color: NWFTH_COLORS.textPrimary }}
                  >
                    Enter a RunNo to get started
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: NWFTH_COLORS.textSecondary }}
                  >
                    Search for partial picking records to review and remove
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results State - Compact Header + Table */}
          {hasSearched && (
            <div className="space-y-4">
              <Card
                className="nwfth-fade-in"
                style={{ borderColor: NWFTH_COLORS.border }}
              >
                <CardHeader
                  className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
                  style={{ backgroundColor: NWFTH_COLORS.backgroundWarm }}
                >
                  <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                    <div className="w-full sm:w-96">
                      <RunNoInput
                        value={runNo}
                        onChange={setRunNo}
                        onSearch={handleSearch}
                        onClear={handleClear}
                        isLoading={isLoading}
                        error={error}
                      />
                    </div>

                    <div className="h-8 w-px bg-gray-300 mx-2 hidden sm:block"></div>

                    <CardTitle
                      className="text-lg flex items-center gap-2"
                      style={{ color: NWFTH_COLORS.textPrimary }}
                    >
                      <span className="hidden sm:inline">RunNo:</span>
                      <strong>{currentRunNo}</strong>
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        ({lines.length} items)
                      </span>
                    </CardTitle>
                  </div>

                  {selectedRows.size > 0 && (
                    <RemoveButton
                      selectedCount={selectedRows.size}
                      isLoading={isLoading}
                      onRemove={handleRemove}
                    />
                  )}
                </CardHeader>

                <CardContent className="p-0">
                  <RMDataTable
                    data={lines}
                    selectedRows={selectedRows}
                    onSelectionChange={setSelection}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer
        className="border-t px-4 py-4 md:px-6"
        style={{
          borderColor: NWFTH_COLORS.border,
          backgroundColor: NWFTH_COLORS.backgroundWarm,
        }}
      >
        <div className="mx-auto max-w-7xl text-center space-y-1">
          <p className="text-xs" style={{ color: NWFTH_COLORS.textMuted }}>
            Version 1.0.0
          </p>
          <p className="text-xs" style={{ color: NWFTH_COLORS.textMuted }}>
            © 2026 Newly Weds Foods Thailand
          </p>
        </div>
      </footer>
    </div>
  );
}
