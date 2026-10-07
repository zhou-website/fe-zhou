import React from "react";
import { UserSidebar } from "@/components/dashboard/UserSidebar";
import { DashboardTopNav } from "@/components/dashboard/DashboardTopNav";
import { DashboardGuard } from "@/components/auth/DashboardGuard";

export const metadata = {
  title: "Dashboard Saya - Zhou Consulting",
  description:
    "Dashboard klien resmi Zhou Consulting untuk monitoring progres layanan konsultasi, lembar kerja akuntansi, pelaporan SPT Coretax 2026, dan unduh berkas resmi.",
};

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardGuard allowedRoles={["user"]} requiredRoleLabel="Klien (User)">
      <div className="min-h-screen bg-[#0B1533] flex font-sans text-text-primary antialiased">
        <UserSidebar />
        <div className="lg:pl-64 flex flex-col flex-1 min-w-0 bg-[#0B1533]">
          <DashboardTopNav role="user" />
          <main className="flex-1 bg-[#F8FAFC] rounded-tl-[32px] p-4 sm:p-6 lg:p-8 w-full min-h-[calc(100vh-76px)]">
            <div className="max-w-[1600px] w-full mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DashboardGuard>
  );
}
