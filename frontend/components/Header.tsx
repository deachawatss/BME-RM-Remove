'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { NWFTH_COLORS } from '@/lib/nwfth-theme';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';

/**
 * Header Component
 * NWFTH branded header with logo, app title, and user info
 */
export function Header() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    toast.info('You have been logged out');
  };

  return (
    <>
      <header
        className="w-full px-4 py-3 md:px-6 md:py-4"
        style={{ backgroundColor: NWFTH_COLORS.primaryBrown }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            {/* NWFTH Logo */}
            <Image
              src="/nwflogo.png"
              alt="NWFTH Logo"
              width={100}
              height={100}
              className="rounded-lg object-contain"
              priority
            />
            <div className="flex flex-col">
              <h1
                className="text-base font-semibold md:text-lg"
                style={{ color: NWFTH_COLORS.background }}
              >
                RM Partial Picking Remover
              </h1>
            </div>
          </div>

          {/* User Info and Logout */}
          {isAuthenticated && user && (
            <div className="flex items-center gap-3">
              <div
                className="nwfth-transition flex items-center gap-2 rounded-full px-3 py-1.5 hidden sm:flex hover:bg-white/10"
                style={{ backgroundColor: 'rgba(250, 248, 244, 0.1)' }}
              >
                <User
                  className="h-4 w-4"
                  style={{ color: NWFTH_COLORS.accentGold }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: NWFTH_COLORS.background }}
                >
                  {user.displayName}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogoutClick}
                className="nwfth-button-press nwfth-transition gap-2 hover:bg-white/10"
                style={{ color: NWFTH_COLORS.background }}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent
          className="sm:max-w-md"
          style={{ borderColor: NWFTH_COLORS.border }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: NWFTH_COLORS.textPrimary }}>
              Confirm Logout
            </DialogTitle>
            <DialogDescription style={{ color: NWFTH_COLORS.textSecondary }}>
              Are you sure you want to log out of the system?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowLogoutConfirm(false)}
              style={{
                borderColor: NWFTH_COLORS.border,
                color: NWFTH_COLORS.textSecondary,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmLogout}
              className="nwfth-button-press"
              style={{
                backgroundColor: NWFTH_COLORS.forestGreen,
                color: 'white',
              }}
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
