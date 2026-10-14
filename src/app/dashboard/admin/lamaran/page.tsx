"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, normalizeRole } from "@/context/AuthContext";
import { UnauthorizedAccess } from "@/components/auth/UnauthorizedAccess";

function AdminLamaranGuardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const role = normalizeRole(user?.role, user?.email);

  useEffect(() => {
    if (!isLoading && isAuthenticated && role === "superadmin") {
      const qs = searchParams.toString();
      const target = qs ? `/dashboard/superadmin/lamaran?${qs}` : "/dashboard/superadmin/lamaran";
      router.replace(target);
    }
  }, [isLoading, isAuthenticated, role, router, searchParams]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-text-muted">
        Memeriksa hak akses lamaran masuk...
      </div>
    );
  }

  if (role === "superadmin") {
    return (
      <div className="p-8 text-center text-xs text-text-muted">
        Mengarahkan ke Halaman Lamaran Masuk Superadmin...
      </div>
    );
  }

  return (
    <UnauthorizedAccess
      requiredRoleLabel="Superadmin"
      allowedRoles={["superadmin"]}
    />
  );
}

export default function AdminLamaranPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-xs text-text-muted">
          Memeriksa hak akses lamaran masuk...
        </div>
      }
    >
      <AdminLamaranGuardContent />
    </React.Suspense>
  );
}
