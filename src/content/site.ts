/**
 * Site-wide configuration.
 *
 * PLACEHOLDERS: phone numbers use ACMA's reserved fictional ranges and the
 * email/domain are examples. Replace with the client's details before launch.
 */
export const site = {
  name: "Koa Physiotherapy",
  shortName: "Koa",
  tagline: "Movement \\ Strength \\ Wellbeing",
  description:
    "Personalised physiotherapy care to help you move with confidence, reduce pain and do more of what you love — in clinic or in your home.",
  url: "https://koaphysio.example",
  phone: "(02) 5550 1234",
  phoneHref: "tel:+61255501234",
  email: "hello@koaphysio.example",
  referralsEmail: "referrals@koaphysio.example",
  fax: "(02) 5550 1235",
  address: {
    line1: "Clinic address to be confirmed",
    line2: "",
  },
  hours: [
    { days: "Monday – Friday", time: "8:00am – 6:00pm" },
    { days: "Saturday", time: "By appointment" },
    { days: "Sunday & public holidays", time: "Closed" },
  ],
  /** Whether a physical clinic is offered. Pending client decision. */
  clinicAvailable: true,
} as const;

export interface NavItem {
  href: string;
  label: string;
}

export const mainNav: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/our-approach", label: "Our Approach" },
  { href: "/home-visits", label: "Home Visits" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" },
];

export const providerNav: NavItem[] = [
  { href: "/gp-referrers", label: "GP & Referrers" },
  { href: "/aged-care-providers", label: "Aged Care Providers" },
];
