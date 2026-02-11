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
          {/* Page Title */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: NWFTH_COLORS.textPrimary }}
              >
                Raw Material Partial Picking Remover
              </h1>
              <p
                className="text-sm"
                style={{ color: NWFTH_COLORS.textSecondary }}
              >
                Remove partial picking entries from ERP system
              </p>
            </div>
          </div>

          {/* Search Section */}
          <Card
            className="nwfth-card-hover"
            style={{ borderColor: NWFTH_COLORS.border }}
          >
            <CardHeader
              className="pb-4"
              style={{ backgroundColor: NWFTH_COLORS.backgroundWarm }}
            >
              <CardTitle
                className="flex items-center gap-2 text-lg"
                style={{ color: NWFTH_COLORS.textPrimary }}
              >
                <Package
                  className="h-5 w-5"
                  style={{ color: NWFTH_COLORS.forestGreen }}
                />
                Search RunNo
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <RunNoInput
                value={runNo}
                onChange={setRunNo}
                onSearch={handleSearch}
                isLoading={isLoading}
                error={error}
              />
            </CardContent>
          </Card>

          {/* Results Section */}
          {hasSearched && (
            <Card
              className="nwfth-fade-in"
              style={{ borderColor: NWFTH_COLORS.border }}
            >
              <CardHeader
                className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between"
                style={{ backgroundColor: NWFTH_COLORS.backgroundWarm }}
              >
                <CardTitle
                  className="text-lg"
                  style={{ color: NWFTH_COLORS.textPrimary }}
                >
                  RM Data
                  {lines.length > 0 && (
                    <span
                      className="ml-2 text-sm font-normal"
                      style={{ color: NWFTH_COLORS.textSecondary }}
                    >
                      (RunNo: {currentRunNo})
                    </span>
                  )}
                </CardTitle>

                {selectedRows.size > 0 && (
                  <RemoveButton
                    selectedCount={selectedRows.size}
                    isLoading={isLoading}
                    onRemove={handleRemove}
                  />
                )}
              </CardHeader>

              <CardContent className="p-0 pt-0">
                <RMDataTable
                  data={lines}
                  selectedRows={selectedRows}
                  onSelectionChange={setSelection}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          {!hasSearched && (
            <Card
              className="nwfth-fade-in border-dashed"
              style={{ borderColor: NWFTH_COLORS.border }}
            >
              <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
                <Info
                  className="h-10 w-10"
                  style={{ color: NWFTH_COLORS.textMuted }}
                />
                <div className="text-center">
                  <p
                    className="text-base font-medium"
                    style={{ color: NWFTH_COLORS.textPrimary }}
                  >
                    Get Started
                  </p>
                  <p
                    className="mt-1 text-sm"
                    style={{ color: NWFTH_COLORS.textSecondary }}
                  >
                    Enter a RunNo above to view and manage partial picking
                    entries.
                  </p>
                </div>
              </CardContent>
            </Card>
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
        <div className="mx-auto max-w-7xl text-center">
          <p
            className="text-sm"
            style={{ color: NWFTH_COLORS.textSecondary }}
          >
            Produced by Wind - ICT NWFTH
          </p>
          <p
            className="mt-1 text-xs"
            style={{ color: NWFTH_COLORS.textMuted }}
          >
            Raw Material Partial Picking Remover v1.0
          </p>
        </div>
      </footer>
    </div>
  );
}
