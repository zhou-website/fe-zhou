import React from "react";
import { UserSidebar } from "@/components/dashboard/UserSidebar";
import { DashboardGuard } from "@/components/auth/DashboardGuard";

export const metadata = {
  title: "Dashboard Saya — Zhou Consulting",
  description:
    "Dashboard klien resmi Zhou Consulting untuk monitoring progres layanan konsultasi, lembar kerja akuntansi, pelaporan SPT Coretax 2026, dan unduh berkas resmi.",
};

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardGuard allowedRoles={["user", "superadmin"]} requiredRoleLabel="Klien (User)">
      <div className="min-h-screen bg-surface flex flex-col font-sans text-text-primary antialiased">
        <UserSidebar />
        <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </DashboardGuard>
  );
}
