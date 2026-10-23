import Link from "next/link";
import { services } from "@/content/services";
import { mainNav, providerNav, site } from "@/content/site";
import { Clock, Mail, Phone } from "@/components/ui/icons";
import { Container } from "@/components/ui/primitives";
import { Logo } from "./logo";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink text-sand-200">
      <Container className="py-16 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo inverted />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-sand-300">{site.description}</p>
            <ul className="mt-6 space-y-3 text-sm">
              <li>
                <a href={site.phoneHref} className="inline-flex items-center gap-2.5 hover:text-white">
                  <Phone className="size-4" /> {site.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2.5 hover:text-white">
                  <Mail className="size-4" /> {site.email}
                </a>
              </li>
            </ul>
          </div>

          <FooterColumn title="Explore" className="lg:col-span-2">
            {mainNav.map((item) => (
              <FooterLink key={item.href} href={item.href}>
                {item.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Services" className="lg:col-span-3">
            {services.map((s) => (
              <FooterLink key={s.slug} href={`/services/${s.slug}`}>
                {s.name}
              </FooterLink>
            ))}
            <FooterLink href="/home-visits">Home Visits & Service Areas</FooterLink>
          </FooterColumn>

          <div className="lg:col-span-3">
            <FooterColumn title="Healthcare providers">
              {providerNav.map((item) => (
                <FooterLink key={item.href} href={item.href}>
                  {item.label}
                </FooterLink>
              ))}
            </FooterColumn>
            <h2 className="eyebrow mt-10 mb-4 text-sand-300">Hours</h2>
            <ul className="space-y-1.5 text-sm">
              {site.hours.map((h) => (
                <li key={h.days} className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 size-4 shrink-0" />
                  <span>
                    <span className="text-sand-50">{h.days}</span>
                    <span className="block text-sand-300">{h.time}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-sand-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. Prototype — all content and appointment data are placeholders.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link href="/privacy" className="hover:text-white">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-white">
                Admin prototype
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="eyebrow mb-4 text-sand-300">{title}</h2>
      <ul className="space-y-2.5 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sand-200 transition-colors hover:text-white">
        {children}
      </Link>
    </li>
  );
}
