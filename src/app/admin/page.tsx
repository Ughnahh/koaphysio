import type { Metadata } from "next";
import { RequestsView } from "@/components/admin/requests-view";

export const metadata: Metadata = { title: "Requests" };

export default function AdminRequestsPage() {
  return <RequestsView />;
}
