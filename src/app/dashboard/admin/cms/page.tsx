"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, normalizeRole } from "@/context/AuthContext";
import { UnauthorizedAccess } from "@/components/auth/UnauthorizedAccess";

function AdminCmsGuardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const role = normalizeRole(user?.role, user?.email);

  useEffect(() => {
    if (!isLoading && isAuthenticated && role === "superadmin") {
      const qs = searchParams.toString();
      const target = qs ? `/dashboard/superadmin/cms?${qs}` : "/dashboard/superadmin/cms";
      router.replace(target);
    }
  }, [isLoading, isAuthenticated, role, router, searchParams]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-text-muted">
        Memeriksa hak akses CMS...
      </div>
    );
  }

  if (role === "superadmin") {
    return (
      <div className="p-8 text-center text-xs text-text-muted">
        Mengarahkan ke Pusat Manajemen CMS Superadmin...
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

export default function AdminCmsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-xs text-text-muted">
          Memeriksa hak akses CMS...
        </div>
      }
    >
      <AdminCmsGuardContent />
    </React.Suspense>
  );
}
