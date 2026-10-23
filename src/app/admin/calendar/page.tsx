import type { Metadata } from "next";
import { CalendarView } from "@/components/admin/calendar-view";

export const metadata: Metadata = { title: "Calendar" };

export default function AdminCalendarPage() {
  return <CalendarView />;
}
