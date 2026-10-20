"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, normalizeRole } from "@/context/AuthContext";
import { UnauthorizedAccess } from "@/components/auth/UnauthorizedAccess";

function AdminUploadGuardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const role = normalizeRole(user?.role, user?.email);

  useEffect(() => {
    if (!isLoading && isAuthenticated && role === "superadmin") {
      const qs = searchParams.toString();
      const target = qs ? `/dashboard/superadmin/upload?${qs}` : "/dashboard/superadmin/upload";
      router.replace(target);
    }
  }, [isLoading, isAuthenticated, role, router, searchParams]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-text-muted">
        Memeriksa hak akses upload dokumen dan billing...
      </div>
    );
  }

  if (role === "superadmin") {
    return (
      <div className="p-8 text-center text-xs text-text-muted">
        Mengarahkan ke Halaman Upload Dokumen & Billing Superadmin...
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

export default function AdminUploadPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-xs text-text-muted">
          Memeriksa hak akses upload dokumen dan billing...
        </div>
      }
    >
      <AdminUploadGuardContent />
    </React.Suspense>
  );
}
