import React from "react";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";
import { DashboardTopNav } from "@/components/dashboard/DashboardTopNav";
import { DashboardGuard } from "@/components/auth/DashboardGuard";

export const metadata = {
  title: "Admin Portal - Zhou Consulting",
  description:
    "Pusat pengelolaan dan kurasi seluruh konten publik, informasi layanan, regulasi, materi edukasi, dan karir Zhou Consulting.",
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardGuard allowedRoles={["admin", "superadmin"]} requiredRoleLabel="Staff Admin">
      <div className="min-h-screen bg-[#0B1533] flex font-sans text-text-primary antialiased">
        <AdminSidebar />
        <div className="lg:pl-64 flex flex-col flex-1 min-w-0 bg-[#0B1533]">
          <DashboardTopNav role="admin" />
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
