"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardIndexPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace("/login?redirect=/dashboard");
      return;
    }

    if (user.role === "admin") {
      router.replace("/dashboard/admin");
    } else if (user.role === "superadmin") {
      router.replace("/dashboard/superadmin");
    } else {
      // Default client role
      router.replace("/dashboard/user");
    }
  }, [user, isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 text-xs text-text-muted">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-medium text-text-primary text-sm">Mengarahkan ke Dashboard...</p>
        <p className="text-xs text-text-muted">Memverifikasi hak akses portal peran Anda.</p>
      </div>
    </div>
  );
}
