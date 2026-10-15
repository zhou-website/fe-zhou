"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuperadminProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/superadmin/perikatan");
  }, [router]);

  return null;
}
