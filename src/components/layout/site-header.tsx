"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { mainNav, providerNav, site } from "@/content/site";
import { ButtonLink } from "@/components/ui/button";
import { Close, Menu, Phone } from "@/components/ui/icons";
import { Container } from "@/components/ui/primitives";
import { Logo } from "./logo";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock scroll, handle Escape and keep focus inside the open menu.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("nav a")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>("a, button");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="relative z-40">
      <Container className="flex items-center justify-between gap-6 py-6 lg:py-8">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-7 xl:gap-10">
            {mainNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative py-2 text-[0.95rem] transition-colors hover:text-ink ${
                      active
                        ? "text-ink after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-ink"
                        : "text-ink-soft"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink href="/book" arrow className="max-sm:hidden">
            Book an Appointment
          </ButtonLink>
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex size-12 items-center justify-center rounded-full text-ink hover:bg-sand-200 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-6" />
            <span className="sr-only">Open menu</span>
          </button>
        </div>
      </Container>

      {open ? (
        <div
          id="mobile-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-50 overflow-y-auto bg-sand-100 lg:hidden"
        >
          <Container className="flex min-h-full flex-col pb-10">
            <div className="flex items-center justify-between py-6">
              <div onClickCapture={close}>
                <Logo />
              </div>
              <button
                type="button"
                className="inline-flex size-12 items-center justify-center rounded-full text-ink hover:bg-sand-200"
                onClick={() => {
                  close();
                  toggleRef.current?.focus();
                }}
              >
                <Close className="size-6" />
                <span className="sr-only">Close menu</span>
              </button>
            </div>
            <nav aria-label="Mobile">
              <ul className="divide-y divide-sand-300 border-y border-sand-300">
                {mainNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={close}
                      aria-current={isActive(pathname, item.href) ? "page" : undefined}
                      className="flex items-center justify-between py-4 text-2xl font-medium aria-[current=page]:font-semibold"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="eyebrow mt-8 mb-3">For healthcare providers</p>
              <ul className="space-y-2">
                {providerNav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} onClick={close} className="text-lg text-ink-soft hover:text-ink">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-auto space-y-3 pt-10">
              <ButtonLink href="/book" arrow size="lg" className="w-full" onClick={close}>
                Book an Appointment
              </ButtonLink>
              <a href={site.phoneHref} className="flex items-center justify-center gap-2 py-3 text-ink-soft">
                <Phone className="size-5" /> Call {site.phone}
              </a>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
