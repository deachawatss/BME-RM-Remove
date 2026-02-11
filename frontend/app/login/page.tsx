'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, User, AlertCircle, Wifi, WifiOff, HelpCircle } from 'lucide-react';
import { toast } from '@/components/ui/toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:6066';

type ConnectionStatus = 'connected' | 'disconnected' | 'unknown';

/**
 * Connection Status Indicator Component
 */
function ConnectionStatusIndicator({ status }: { status: ConnectionStatus }) {
  const config = {
    connected: {
      icon: Wifi,
      text: 'Backend Connected',
      className: 'text-green-600 bg-green-50 border-green-200',
    },
    disconnected: {
      icon: WifiOff,
      text: 'Backend Disconnected',
      className: 'text-red-600 bg-red-50 border-red-200',
    },
    unknown: {
      icon: HelpCircle,
      text: 'Checking connection...',
      className: 'text-amber-600 bg-amber-50 border-amber-200',
    },
  };

  const { icon: Icon, text, className } = config[status];

  return (
    <div className={`flex items-center justify-center gap-2 rounded-full px-3 py-1 text-xs font-medium border ${className}`}>
      <Icon className="h-3 w-3" />
      <span>{text}</span>
    </div>
  );
}

/**
 * Login Page
 * LDAP/SQL authentication with NWFTH branding
 * Styled to match BME-Partial-Picking
 */
export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('unknown');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Check connection status
  const checkConnection = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_URL}/api/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      setConnectionStatus(response.ok ? 'connected' : 'disconnected');
    } catch {
      setConnectionStatus('disconnected');
    }
  }, []);

  // Poll connection status every 30 seconds
  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  // Auto-focus username field on mount
  useEffect(() => {
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
      usernameInput.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    // Validation
    if (!username.trim()) {
      setValidationError('Please enter your username');
      return;
    }

    if (!password) {
      setValidationError('Please enter your password');
      return;
    }

    const success = await login(username, password);
    if (success) {
      toast.success(`Welcome back, ${username}!`);
      router.push('/dashboard');
    }
  };

  // Handle Enter key on inputs
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && username && password) {
      handleSubmit(e);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#3A2920] via-[#3A2920]/90 to-[#3A2920]/80 p-4">
      {/* Main Card */}
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="space-y-4 pb-6">
          {/* Logo and Title */}
          <div className="flex flex-col items-center gap-4">
            {/* NWFTH Logo */}
            <div className="flex h-16 w-16 items-center justify-center rounded-xl text-xl font-bold shadow-lg bg-[#3A2920] text-[#E0AA2F]">
              NWFTH
            </div>

            {/* Title */}
            <div className="text-center">
              <CardTitle className="text-xl font-bold text-[#3A2920]">
                Raw Material Partial Picking Remover
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-gray-600">
                Northern Wind Food Thailand
              </CardDescription>
            </div>

            {/* Connection Status */}
            <ConnectionStatusIndicator status={connectionStatus} />
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="pl-10 h-11 border-gray-300 focus:border-[#3F7D3E] focus:ring-[#3F7D3E]"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="pl-10 h-11 border-gray-300 focus:border-[#3F7D3E] focus:ring-[#3F7D3E]"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Error Messages */}
            {(error || validationError) && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {error || validationError}
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || connectionStatus === 'disconnected'}
              className="w-full h-11 bg-[#3F7D3E] hover:bg-[#356B34] text-white font-medium"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Authenticating...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-gray-500">
            Produced by Wind - ICT NWFTH
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
