import React from "react";
import { SuperadminSidebar } from "@/components/dashboard/SuperadminSidebar";
import { DashboardTopNav } from "@/components/dashboard/DashboardTopNav";
import { DashboardGuard } from "@/components/auth/DashboardGuard";

export const metadata = {
  title: "Superadmin Portal - Zhou Consulting",
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
      <div className="min-h-screen bg-white flex font-sans text-text-primary antialiased">
        <SuperadminSidebar />
        <div className="lg:pl-64 flex flex-col flex-1 min-w-0 transition-all duration-300">
          <DashboardTopNav role="superadmin" profileUrl="/dashboard/superadmin/profil" />
          <main className="flex-1 bg-[#F8FAFC] rounded-tl-[32px] p-4 sm:p-6 lg:p-8 w-full min-h-[calc(100vh-76px)] transition-all">
            <div className="max-w-[1600px] w-full mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DashboardGuard>
  );
}
