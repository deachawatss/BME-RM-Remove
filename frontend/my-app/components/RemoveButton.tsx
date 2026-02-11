'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { NWFTH_COLORS } from '@/lib/nwfth-theme';

/**
 * Props for RemoveButton component
 */
interface RemoveButtonProps {
  /** Number of selected rows */
  selectedCount: number;

  /** Whether removal operation is in progress */
  isLoading?: boolean;

  /** Callback when remove is confirmed */
  onRemove: () => Promise<void>;
}

/**
 * Remove Button Component
 * Delete action button with confirmation dialog
 */
export function RemoveButton({
  selectedCount,
  isLoading = false,
  onRemove,
}: RemoveButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleOpen = () => {
    setError(null);
    setSuccess(false);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isRemoving) return; // Prevent closing while removing
    setIsOpen(false);
    setError(null);
    setSuccess(false);
  };

  const handleConfirmRemove = async () => {
    setIsRemoving(true);
    setError(null);

    try {
      await onRemove();
      setSuccess(true);
      // Auto close after success
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while removing records'
      );
    } finally {
      setIsRemoving(false);
    }
  };

  const isDisabled = selectedCount === 0 || isLoading;

  return (
    <>
      <Button
        onClick={handleOpen}
        disabled={isDisabled}
        className="nwfth-button-press nwfth-transition gap-2 hover:opacity-90"
        style={{
          backgroundColor: isDisabled ? NWFTH_COLORS.border : NWFTH_COLORS.danger,
          color: 'white',
        }}
      >
        <Trash2 className="h-4 w-4" />
        Remove Selected
        {selectedCount > 0 && (
          <span
            className="ml-1 rounded-full px-2 py-0.5 text-xs"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            {selectedCount}
          </span>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent
          className="sm:max-w-md"
          style={{ borderColor: NWFTH_COLORS.border }}
        >
          <DialogHeader>
            <DialogTitle
              className="flex items-center gap-2"
              style={{ color: NWFTH_COLORS.textPrimary }}
            >
              {success ? (
                <CheckCircle
                  className="h-5 w-5"
                  style={{ color: NWFTH_COLORS.forestGreen }}
                />
              ) : (
                <AlertTriangle
                  className="h-5 w-5"
                  style={{ color: NWFTH_COLORS.danger }}
                />
              )}
              {success ? 'Removal Successful' : 'Confirm Removal'}
            </DialogTitle>
            <DialogDescription style={{ color: NWFTH_COLORS.textSecondary }}>
              {success
                ? `Successfully removed ${selectedCount} record(s).`
                : `You are about to remove ${selectedCount} partial picking record(s). This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>

          {!success && (
            <>
              <div
                className="rounded-lg border p-4"
                style={{
                  borderColor: NWFTH_COLORS.border,
                  backgroundColor: NWFTH_COLORS.backgroundWarm,
                }}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className="h-5 w-5 flex-shrink-0"
                    style={{ color: NWFTH_COLORS.accentGold }}
                  />
                  <div className="space-y-1">
                    <p
                      className="text-sm font-medium"
                      style={{ color: NWFTH_COLORS.textPrimary }}
                    >
                      Warning
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: NWFTH_COLORS.textSecondary }}
                    >
                      This will permanently remove the selected partial picking
                      entries from the system. The original quantities will be
                      preserved in the audit log.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <Alert
                  variant="destructive"
                  style={{
                    backgroundColor: `${NWFTH_COLORS.danger}10`,
                    borderColor: NWFTH_COLORS.danger,
                    color: NWFTH_COLORS.danger,
                  }}
                >
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isRemoving}
                  className="nwfth-button-press"
                  style={{
                    borderColor: NWFTH_COLORS.border,
                    color: NWFTH_COLORS.textSecondary,
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmRemove}
                  disabled={isRemoving}
                  className="nwfth-button-press gap-2 hover:opacity-90"
                  style={{
                    backgroundColor: NWFTH_COLORS.danger,
                    color: 'white',
                  }}
                >
                  {isRemoving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Confirm Remove
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}

          {success && (
            <DialogFooter>
              <Button
                onClick={handleClose}
                className="nwfth-button-press"
                style={{
                  backgroundColor: NWFTH_COLORS.forestGreen,
                  color: 'white',
                }}
              >
                Close
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
