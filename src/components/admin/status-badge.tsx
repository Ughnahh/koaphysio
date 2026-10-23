import type { AppointmentStatus } from "@/lib/booking/types";

export const STATUS_META: Record<AppointmentStatus, { label: string; badge: string; block: string }> = {
  pending: { label: "Pending", badge: "bg-warning-bg text-warning", block: "border-warning bg-warning-bg text-warning" },
  offered: { label: "Alternative offered", badge: "bg-info-bg text-info", block: "border-info bg-info-bg text-info" },
  approved: { label: "Confirmed", badge: "bg-success-bg text-success", block: "border-success bg-success-bg text-success" },
  declined: { label: "Declined", badge: "bg-sand-200 text-muted", block: "border-sand-400 bg-sand-200 text-muted" },
  expired: { label: "Expired", badge: "bg-sand-200 text-muted", block: "border-sand-400 bg-sand-200 text-muted" },
  cancelled: { label: "Cancelled", badge: "bg-danger-bg text-danger", block: "border-danger bg-danger-bg text-danger" },
  completed: { label: "Completed", badge: "bg-sand-200 text-ink-soft", block: "border-sand-400 bg-sand-100 text-ink-soft" },
  no_show: { label: "No-show", badge: "bg-danger-bg text-danger", block: "border-danger bg-danger-bg text-danger" },
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.badge}`}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {meta.label}
    </span>
  );
}
