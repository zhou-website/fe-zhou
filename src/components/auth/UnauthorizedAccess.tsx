"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ShieldTaxIcon, LockIcon } from "@/components/icons";

interface UnauthorizedAccessProps {
  requiredRoleLabel: string;
  allowedRoles: ("user" | "admin" | "superadmin")[];
}

export function UnauthorizedAccess({ requiredRoleLabel, allowedRoles }: UnauthorizedAccessProps) {
  const { user, logout } = useAuth();

  const currentRoleLabel =
    user?.role === "superadmin"
      ? "Superadmin"
      : user?.role === "admin"
      ? "Staff Admin"
      : "Klien / Pengguna Publik";

  const ownDashboardPath =
    user?.role === "superadmin"
      ? "/dashboard/superadmin"
      : user?.role === "admin"
      ? "/dashboard/admin"
      : "/dashboard/user";

  const ownDashboardLabel =
    user?.role === "superadmin"
      ? "Superadmin Portal"
      : user?.role === "admin"
      ? "Admin Portal"
      : "Dashboard Saya";

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-error/20 shadow-xl p-6 sm:p-8 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-error/10 text-error flex items-center justify-center mx-auto text-2xl shadow-inner">
          <LockIcon />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error/10 text-error text-[11px] font-bold">
            <ShieldTaxIcon className="text-xs" />
            <span>403 &bull; Akses Ditolak (Unauthorized)</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
            Izin Otoritas Tidak Sesuai
          </h2>

          <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
            Halaman ini khusus diperuntukkan bagi peran{" "}
            <strong className="text-primary font-semibold">{requiredRoleLabel}</strong>. Akun
            Anda saat ini teridentifikasi sebagai{" "}
            <strong className="text-error font-semibold">{currentRoleLabel}</strong>.
          </p>

          {allowedRoles && allowedRoles.length > 0 && (
            <div className="pt-1 flex items-center justify-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-text-muted">Peran yang diizinkan:</span>
              {allowedRoles.map((r) => (
                <span
                  key={r}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                >
                  {r === "user" ? "Klien" : r === "admin" ? "Staff Admin" : "Superadmin"}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <Button
            variant="primary"
            size="lg"
            asChild
            className="w-full font-semibold text-xs justify-center shadow-md h-11"
          >
            <Link href={ownDashboardPath}>
              <span>Buka {ownDashboardLabel}</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="w-full font-semibold text-xs border-primary-light text-text-secondary hover:text-primary hover:bg-surface cursor-pointer h-10"
          >
            <Link href="/">← Kembali ke Website</Link>
          </Button>

          <button
            type="button"
            onClick={logout}
            className="text-[11px] text-text-muted hover:text-error transition-colors pt-1 cursor-pointer"
          >
            Keluar atau Ganti Akun Lain
          </button>
        </div>
      </div>
    </div>
  );
}
