'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { NWFTH_COLORS } from '@/lib/nwfth-theme';

/**
 * Toast type for different message styles
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Toast item interface
 */
interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

/**
 * Toast store for managing toasts
 */
let toastListeners: ((toasts: ToastItem[]) => void)[] = [];
let toasts: ToastItem[] = [];

const notifyListeners = () => {
  toastListeners.forEach((listener) => listener([...toasts]));
};

export const toast = {
  success: (message: string, duration = 4000) => {
    const id = Date.now().toString();
    toasts = [...toasts, { id, message, type: 'success', duration }];
    notifyListeners();
    setTimeout(() => toast.dismiss(id), duration);
  },
  error: (message: string, duration = 5000) => {
    const id = Date.now().toString();
    toasts = [...toasts, { id, message, type: 'error', duration }];
    notifyListeners();
    setTimeout(() => toast.dismiss(id), duration);
  },
  info: (message: string, duration = 4000) => {
    const id = Date.now().toString();
    toasts = [...toasts, { id, message, type: 'info', duration }];
    notifyListeners();
    setTimeout(() => toast.dismiss(id), duration);
  },
  warning: (message: string, duration = 4000) => {
    const id = Date.now().toString();
    toasts = [...toasts, { id, message, type: 'warning', duration }];
    notifyListeners();
    setTimeout(() => toast.dismiss(id), duration);
  },
  dismiss: (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    notifyListeners();
  },
};

/**
 * Hook to subscribe to toast changes
 */
function useToasts() {
  const [state, setState] = useState<ToastItem[]>([]);

  useEffect(() => {
    toastListeners.push(setState);
    setState([...toasts]);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setState);
    };
  }, []);

  return state;
}

/**
 * Get toast styling based on type
 */
function getToastStyles(type: ToastType) {
  switch (type) {
    case 'success':
      return {
        backgroundColor: '#3F7D3E',
        icon: CheckCircle,
      };
    case 'error':
      return {
        backgroundColor: '#C62828',
        icon: AlertCircle,
      };
    case 'warning':
      return {
        backgroundColor: '#E0AA2F',
        icon: AlertCircle,
      };
    case 'info':
    default:
      return {
        backgroundColor: '#5B7EA7',
        icon: Info,
      };
  }
}

/**
 * Individual Toast component
 */
function ToastItem({ toast }: { toast: ToastItem }) {
  const [isExiting, setIsExiting] = useState(false);
  const styles = getToastStyles(toast.type);
  const Icon = styles.icon;

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      toastApi.dismiss(toast.id);
    }, 200);
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg nwfth-transition ${
        isExiting ? 'nwfth-toast-exit' : 'nwfth-toast-enter'
      }`}
      style={{
        backgroundColor: styles.backgroundColor,
        color: 'white',
        minWidth: '300px',
        maxWidth: '500px',
      }}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 rounded-full p-1 transition-colors hover:bg-white/20"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Rename for internal use
const toastApi = toast;

/**
 * Toast Container Component
 * Place this in your layout to display toasts
 */
export function ToastContainer() {
  const toasts = useToasts();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
