import React from "react";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";
import { DashboardGuard } from "@/components/auth/DashboardGuard";

export const metadata = {
  title: "Admin Portal — Zhou Consulting",
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
      <div className="min-h-screen bg-surface flex flex-col font-sans text-text-primary antialiased">
        <AdminSidebar />
        <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </DashboardGuard>
  );
}
