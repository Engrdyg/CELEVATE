import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminApp } from "@/components/admin/admin-app";

export const metadata: Metadata = { title: "Question bank admin", robots: { index: false, follow: false } };

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminApp />
    </Suspense>
  );
}
