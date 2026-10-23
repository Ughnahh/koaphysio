/**
 * Inline stroke icons (no icon library dependency).
 * Decorative by default; pass `title` to expose an accessible name.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function Icon({ title, children, className = "size-5", strokeWidth = 1.6, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export const ArrowRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 12h15M14 6.5 19.5 12 14 17.5" />
  </Icon>
);
export const ArrowLeft = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 12H5M10 6.5 4.5 12l5.5 5.5" />
  </Icon>
);
export const ChevronLeft = (p: IconProps) => (
  <Icon {...p}>
    <path d="m15 5-7 7 7 7" />
  </Icon>
);
export const ChevronRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="m9 5 7 7-7 7" />
  </Icon>
);
export const ChevronDown = (p: IconProps) => (
  <Icon {...p}>
    <path d="m5 9 7 7 7-7" />
  </Icon>
);
export const Menu = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 7h18M3 12h18M3 17h18" />
  </Icon>
);
export const Close = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);
export const Check = (p: IconProps) => (
  <Icon {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </Icon>
);
export const Phone = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 4h3.5l1.5 4.5-2.25 1.5a11 11 0 0 0 6.25 6.25L15.5 14 20 15.5V19a1.5 1.5 0 0 1-1.5 1.5A15.5 15.5 0 0 1 3.5 5.5 1.5 1.5 0 0 1 5 4Z" />
  </Icon>
);
export const Mail = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
  </Icon>
);
export const Clock = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Icon>
);
export const MapPin = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </Icon>
);
export const Home = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 11 12 4l8.5 7" />
    <path d="M5.5 9.5V20h13V9.5" />
    <path d="M10 20v-5.5h4V20" />
  </Icon>
);
export const Building = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4.5" y="3.5" width="15" height="17" rx="1.5" />
    <path d="M9 7.5h1.5M13.5 7.5H15M9 11h1.5M13.5 11H15M9 14.5h1.5M13.5 14.5H15M10.5 20.5v-3h3v3" />
  </Icon>
);
export const Calendar = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4" />
  </Icon>
);
export const User = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="3.75" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </Icon>
);
export const Users = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="9" cy="8.5" r="3.25" />
    <path d="M2.75 19.5a6.25 6.25 0 0 1 12.5 0" />
    <path d="M15.5 5.6a3.25 3.25 0 0 1 0 5.8M17.5 13.6a6.25 6.25 0 0 1 3.75 5.9" />
  </Icon>
);
export const Alert = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5v5.25M12 16.25v.25" />
  </Icon>
);
export const Info = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.5M12 7.75V8" />
  </Icon>
);
export const Search = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.25-4.25" />
  </Icon>
);
export const FileText = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14 3.5H7A1.5 1.5 0 0 0 5.5 5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8L14 3.5Z" />
    <path d="M14 3.5V8h4.5M8.5 12.5h7M8.5 16h7" />
  </Icon>
);
export const Heart = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 19.5s-7.5-4.4-7.5-10A4.25 4.25 0 0 1 12 7a4.25 4.25 0 0 1 7.5 2.5c0 5.6-7.5 10-7.5 10Z" />
  </Icon>
);
export const Sparkle = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
  </Icon>
);
export const LayoutGrid = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </Icon>
);
export const Inbox = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 13.5 6 5h12l2.5 8.5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19v-5.5Z" />
    <path d="M3.5 13.5H8l1.5 2.5h5l1.5-2.5h4.5" />
  </Icon>
);
export const Settings = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 6.5h10M18 6.5h2M4 12h3M11 12h9M4 17.5h8M16 17.5h4" />
    <circle cx="16" cy="6.5" r="2" />
    <circle cx="9" cy="12" r="2" />
    <circle cx="14" cy="17.5" r="2" />
  </Icon>
);
export const Refresh = (p: IconProps) => (
  <Icon {...p}>
    <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3L19.5 9" />
    <path d="M19.5 4.5V9H15" />
  </Icon>
);
export const Plus = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);
export const Trash = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" />
  </Icon>
);
export const Shield = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.5 5 6v5.5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-2.5Z" />
    <path d="m9 12 2 2 4-4.5" />
  </Icon>
);

/* Service illustrations — line drawings in the style of the reference. */

export const Runner = (p: IconProps) => (
  <Icon strokeWidth={1.4} {...p}>
    <circle cx="14.5" cy="4.25" r="1.75" />
    <path d="m8 9.5 3.5-2.25 3 1 2 3 3 .75" />
    <path d="m11.5 7.25-1.75 6 3.75 2.5-1 5" />
    <path d="M9.75 13.25 8 17l-4 .5" />
  </Icon>
);
export const Spine = (p: IconProps) => (
  <Icon strokeWidth={1.4} {...p}>
    <path d="M11 2.5c1.5.5 2 1.5 1.25 2.75" />
    <rect x="9.5" y="5.25" width="4.5" height="2.5" rx="1" />
    <rect x="9.75" y="8.75" width="4.5" height="2.5" rx="1" transform="rotate(-4 12 10)" />
    <rect x="10" y="12.25" width="4.5" height="2.5" rx="1" />
    <rect x="9.75" y="15.75" width="4.5" height="2.5" rx="1" transform="rotate(4 12 17)" />
    <path d="M12 18.5c-.5 1.25-.25 2.25.5 3" />
    <path d="M8.5 6.5 7.5 6M15 6.5l1-.5M8.75 10 7.75 10.25M15.25 10l1 .25M9 13.5H8M15.5 13.5h1M8.75 17l-1 .5M15.25 17l1 .5" />
  </Icon>
);
export const Dumbbell = (p: IconProps) => (
  <Icon strokeWidth={1.4} {...p}>
    <path d="M7.5 12h9" />
    <rect x="4.5" y="7.5" width="3" height="9" rx="1" />
    <rect x="16.5" y="7.5" width="3" height="9" rx="1" />
    <path d="M4.5 10H2.75v4H4.5M19.5 10h1.75v4H19.5" />
  </Icon>
);
export const Seated = (p: IconProps) => (
  <Icon strokeWidth={1.4} {...p}>
    <circle cx="12.5" cy="4.25" r="1.75" />
    <path d="M12 7.5 10.75 13h4.75l1 6" />
    <path d="M11.5 9.25 14.5 11l2-1.5" />
    <path d="M7 10.5V19M7 15h9.5M16.5 15v4M7.5 19h0" />
  </Icon>
);
