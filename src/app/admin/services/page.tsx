import type { Metadata } from "next";
import { ServicesView } from "@/components/admin/services-view";

export const metadata: Metadata = { title: "Services" };

export default function AdminServicesPage() {
  return <ServicesView />;
}
