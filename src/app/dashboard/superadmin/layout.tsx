import React from "react";
import { SuperadminSidebar } from "@/components/dashboard/SuperadminSidebar";
import { DashboardGuard } from "@/components/auth/DashboardGuard";

export const metadata = {
  title: "Superadmin Portal — Zhou Consulting",
  description:
    "Konsol otoritas eksekutif superadmin untuk manajemen akun staf konsultan, hak akses RBAC, dan audit trail sistem Zhou Consulting.",
};

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardGuard allowedRoles={["superadmin"]} requiredRoleLabel="Superadmin">
      <div className="min-h-screen bg-surface flex flex-col font-sans text-text-primary antialiased">
        <SuperadminSidebar />
        <div className="md:pl-64 flex flex-col flex-1 min-w-0">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </DashboardGuard>
  );
}
