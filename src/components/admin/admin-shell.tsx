"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { resetPrototypeData } from "@/lib/booking/client";
import { Calendar, Inbox, LayoutGrid, Refresh, Settings } from "@/components/ui/icons";

const nav = [
  { href: "/admin", label: "Requests", icon: Inbox },
  { href: "/admin/calendar", label: "Calendar", icon: Calendar },
  { href: "/admin/availability", label: "Availability", icon: Settings },
  { href: "/admin/services", label: "Services", icon: LayoutGrid },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-sand-100 lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-sand-300 bg-sand-50 lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 px-5 py-4 lg:block lg:px-6 lg:py-8">
          <Link href="/admin" className="flex items-baseline gap-2">
            <span className="text-3xl font-black lowercase tracking-[-0.06em]">koa</span>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">Admin</span>
          </Link>
          <Link href="/" className="text-sm text-muted underline-offset-4 hover:underline lg:mt-2 lg:block">
            View website
          </Link>
        </div>
        <nav aria-label="Admin" className="overflow-x-auto px-3 pb-3 lg:px-4">
          <ul className="flex gap-1 lg:flex-col">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      active ? "bg-ink text-sand-50" : "text-ink-soft hover:bg-sand-200"
                    }`}
                  >
                    <Icon className="size-5" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="hidden px-6 lg:absolute lg:bottom-6 lg:block">
          <button
            type="button"
            onClick={() => {
              resetPrototypeData();
              window.location.reload();
            }}
            className="inline-flex items-center gap-2 text-xs text-muted hover:text-ink"
          >
            <Refresh className="size-4" /> Reset demo data
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <div role="note" className="bg-warning-bg px-5 py-2.5 text-center text-xs text-warning lg:px-8">
          <strong>Prototype only.</strong> No login, no real data. Changes are stored in this browser tab and lost when it
          closes. Authentication and audit logging arrive with the backend.
        </div>
        <main id="main" className="px-5 py-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold">{title}</h1>
        {description ? <p className="mt-1 text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
