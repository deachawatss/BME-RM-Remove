'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NWFTH_COLORS } from '@/lib/nwfth-theme';
import { Lock, User, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/toast';

/**
 * Login Page
 * LDAP authentication with NWFTH branding
 */
export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

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
    <div
      className="nwfth-fade-in flex min-h-screen flex-col items-center justify-center p-4"
      style={{ backgroundColor: NWFTH_COLORS.background }}
    >
      {/* NWFTH Header */}
      <div className="mb-8 flex flex-col items-center gap-4">
        {/* Logo */}
        <div
          className="nwfth-card-hover flex h-16 w-16 items-center justify-center rounded-xl text-2xl font-bold shadow-lg"
          style={{
            backgroundColor: NWFTH_COLORS.primaryBrown,
            color: NWFTH_COLORS.accentGold,
          }}
        >
          NWFTH
        </div>
        <div className="text-center">
          <h1
            className="text-2xl font-bold"
            style={{ color: NWFTH_COLORS.textPrimary }}
          >
            Northern Wind Food Thailand
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: NWFTH_COLORS.textSecondary }}
          >
            Raw Material Partial Picking Remover
          </p>
        </div>
      </div>

      {/* Login Card */}
      <Card
        className="nwfth-card-hover w-full max-w-md shadow-xl"
        style={{ borderColor: NWFTH_COLORS.border }}
      >
        <CardHeader
          className="rounded-t-lg"
          style={{ backgroundColor: NWFTH_COLORS.backgroundWarm }}
        >
          <CardTitle
            className="text-xl"
            style={{ color: NWFTH_COLORS.textPrimary }}
          >
            LDAP Login
          </CardTitle>
          <CardDescription style={{ color: NWFTH_COLORS.textSecondary }}>
            Enter your credentials to access the system
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-2">
              <Label
                htmlFor="username"
                style={{ color: NWFTH_COLORS.textPrimary }}
              >
                Username
              </Label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: NWFTH_COLORS.textMuted }}
                />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="nwfth-input-focus pl-10"
                  style={{ borderColor: NWFTH_COLORS.border }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                style={{ color: NWFTH_COLORS.textPrimary }}
              >
                Password
              </Label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: NWFTH_COLORS.textMuted }}
                />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="nwfth-input-focus pl-10"
                  style={{ borderColor: NWFTH_COLORS.border }}
                />
              </div>
            </div>

            {/* Error Messages */}
            {(error || validationError) && (
              <Alert
                variant="destructive"
                style={{
                  backgroundColor: `${NWFTH_COLORS.danger}10`,
                  borderColor: NWFTH_COLORS.danger,
                }}
              >
                <AlertCircle
                  className="h-4 w-4"
                  style={{ color: NWFTH_COLORS.danger }}
                />
                <AlertDescription style={{ color: NWFTH_COLORS.danger }}>
                  {error || validationError}
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="nwfth-button-press nwfth-transition w-full gap-2 hover:opacity-90"
              style={{
                backgroundColor: NWFTH_COLORS.forestGreen,
                color: 'white',
              }}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Authenticating...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <p
        className="mt-8 text-center text-sm"
        style={{ color: NWFTH_COLORS.textMuted }}
      >
        Produced by Wind - ICT NWFTH
      </p>
    </div>
  );
}
