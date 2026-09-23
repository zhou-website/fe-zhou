"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UnauthorizedAccess } from "./UnauthorizedAccess";

interface DashboardGuardProps {
  allowedRoles: ("user" | "admin" | "superadmin")[];
  requiredRoleLabel: string;
  children: React.ReactNode;
}

export function DashboardGuard({
  allowedRoles,
  requiredRoleLabel,
  children,
}: DashboardGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Guest attempting to access protected dashboard -> redirect to login with return destination
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6 text-xs text-text-muted">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Memeriksa hak akses autentikasi...</span>
        </div>
      </div>
    );
  }

  // Not authenticated yet (redirecting)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6 text-xs text-text-muted">
        <span>Mengarahkan ke halaman masuk...</span>
      </div>
    );
  }

  // Role authorization check
  const isAuthorized = allowedRoles.includes(user.role);
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-surface py-12">
        <UnauthorizedAccess
          requiredRoleLabel={requiredRoleLabel}
          allowedRoles={allowedRoles}
        />
      </div>
    );
  }

  // Authorized -> render protected content
  return <>{children}</>;
}
