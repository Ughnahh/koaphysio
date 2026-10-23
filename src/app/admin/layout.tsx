import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Koa Admin" },
  robots: { index: false, follow: false },
};

/**
 * PROTOTYPE: no authentication. In Phase 2 this layout must verify an
 * authenticated admin session (with MFA) on the server before rendering.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
