'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { NWFTH_COLORS } from '@/lib/nwfth-theme';

/**
 * Props for RunNoInput component
 */
interface RunNoInputProps {
  /** Current RunNo value */
  value: string;

  /** Callback when RunNo changes */
  onChange: (value: string) => void;

  /** Callback when search is triggered */
  onSearch: (runNo: number) => void;

  /** Callback when clear is triggered */
  onClear?: () => void;

  /** Whether search is in progress */
  isLoading?: boolean;

  /** Error message to display */
  error?: string | null;
}

/**
 * RunNo Input Component
 * Input field for RunNo with search and clear buttons
 */
export function RunNoInput({
  value,
  onChange,
  onSearch,
  onClear,
  isLoading = false,
  error,
}: RunNoInputProps) {
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSearch = () => {
    setLocalError(null);

    const runNo = parseInt(value, 10);

    if (isNaN(runNo) || runNo <= 0) {
      setLocalError('Please enter a valid RunNo');
      return;
    }

    onSearch(runNo);
  };

  const handleClear = () => {
    onChange('');
    setLocalError(null);
    onClear?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const displayError = error || localError;

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Input
            type="text"
            inputMode="numeric"
            placeholder="Enter RunNo..."
            value={value}
            onChange={(e) => {
              // Only allow numeric input
              const numericValue = e.target.value.replace(/[^0-9]/g, '');
              onChange(numericValue);
              setLocalError(null);
            }}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="nwfth-input-focus h-11 pr-10 text-base transition-all duration-200"
            style={{
              borderColor: displayError ? NWFTH_COLORS.danger : NWFTH_COLORS.border,
            }}
          />
          {value && (
            <button
              onClick={handleClear}
              className="nwfth-button-press absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition-all duration-200 hover:bg-gray-100"
              style={{ color: NWFTH_COLORS.textMuted }}
              aria-label="Clear input"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSearch}
            disabled={isLoading || !value}
            className="nwfth-button-press h-11 gap-2 px-6 transition-all duration-200 hover:opacity-90"
            style={{
              backgroundColor: NWFTH_COLORS.forestGreen,
              color: 'white',
            }}
          >
            <Search className="h-4 w-4" />
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={isLoading || !value}
            className="nwfth-button-press h-11 px-4 transition-all duration-200 hover:bg-gray-50"
            style={{
              borderColor: NWFTH_COLORS.border,
              color: NWFTH_COLORS.textSecondary,
            }}
          >
            Clear
          </Button>
        </div>
      </div>

      {displayError && (
        <p
          className="text-sm"
          style={{ color: NWFTH_COLORS.danger }}
        >
          {displayError}
        </p>
      )}
    </div>
  );
}
