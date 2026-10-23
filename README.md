# Koa Physiotherapy — website & booking prototype

Phase 1 frontend prototype for Koa Physiotherapy: the public website, the appointment request flow and an
admin dashboard prototype, all running on **fictional mock data**.

> **Prototype only.** There is no authentication, database, email delivery or real booking. Nothing entered on
> the site leaves the browser. Do not deploy this build for real customers.

## Stack

- [Next.js](https://nextjs.org) (App Router) · TypeScript · Tailwind CSS v4
- Montserrat, self-hosted via `@fontsource-variable/montserrat` (no Google Fonts requests)
- No UI, icon, calendar, form or date libraries — icons are inline SVG and the calendar is a custom grid
- Booking rules are tested with Node's built-in test runner (no test framework dependency)

## Getting started

Requires Node.js 20.9+ (developed on Node 22).

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script              | Purpose                                   |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Development server                        |
| `npm run build`     | Production build (type-checks the app)    |
| `npm start`         | Serve the production build                |
| `npm run lint`      | ESLint (Next.js core-web-vitals + TS)     |
| `npm run typecheck` | `tsc --noEmit`                            |
| `npm test`          | Unit tests for the booking rules          |

Next.js collects anonymous telemetry by default; opt out with `npx next telemetry disable`.

## What's included

**Public site** — Home, About / Meet the Team, Services (+ four service pages), Our Approach, Home Visits &
Service Areas (with a suburb checker), FAQs, Contact (form validates but sends nothing), GP & Referrers,
Aged Care Providers, a placeholder Privacy page, and 404/error pages.

**Booking flow** (`/book`) — service and clinic/home choice → service-area check (home visits) → physio
(Alyssa, Alma or no preference) → live mock availability → details with a collection notice → review →
*pending approval* confirmation. Deep links pre-fill the form, e.g.
`/book?service=aged-care-physiotherapy&mode=home&practitioner=alma`.

**Admin prototype** (`/admin`) — request inbox with approve / decline / suggest another time, cancel,
reschedule, complete / no-show; week calendar with leave shading (agenda view on mobile); weekly hours,
breaks and leave editor; service duration / buffer / availability editor.

A request submitted on `/book` appears in `/admin` in the same browser tab (state is kept in
`sessionStorage`). Use **Reset demo data** in the admin sidebar to start over.

### Previewing states

Append `?demo=` to any booking or admin URL:

| Value      | Effect                                              |
| ---------- | --------------------------------------------------- |
| `slow`     | ~2.5 s responses (loading states)                   |
| `empty`    | No availability (empty states)                      |
| `error`    | Every mock call fails (error states and retry)      |
| `conflict` | Submitting a request returns "time no longer available" |

## Project structure

```
src/
  app/
    (site)/              public pages, sharing the site header/footer
    admin/               admin prototype (no auth — see layout.tsx)
  components/
    layout/ ui/ home/ shared/
    booking/             booking wizard steps (UI only)
    admin/               admin views and appointment dialog
  content/               site copy, services, team, FAQs, service areas (placeholders)
  lib/
    booking/
      types.ts           domain types shared by UI and backend
      rules.ts           pure rules: time zones, slots, overlaps, hold expiry
      rules.test.ts      unit tests
      validation.ts      form validation (re-run on the server in Phase 2)
      policy.ts          booking policy (notice, horizon, hold period, time zone)
      client.ts          BookingClient / AdminClient interfaces — the backend seam
      mock/              in-browser mock implementation + fictional seed data
    use-async.ts         small data-loading hook with loading/error/retry
```

### Replacing the mock with a real backend (Phase 2)

UI components only call `getBookingClient()` / `getAdminClient()` from `src/lib/booking/client.ts`.
To connect the real backend, implement those two interfaces (e.g. with server actions backed by Postgres)
and return them from `client.ts`; no component needs to change. The mock mirrors the intended server
behaviour: it re-derives availability instead of trusting the browser, uses an idempotency key, sweeps
expired holds, and rejects overlaps (including travel buffers) the way the planned Postgres exclusion
constraint will.

## Placeholders to replace before launch

- **All copy** — bios, credentials, service descriptions, FAQs, fees/funding, referral process (check
  against AHPRA advertising guidelines).
- **Contact details** — phone numbers use ACMA's reserved fictional ranges; email/domain are `.example`.
- **Clinic address and hours**, and whether a clinic is offered at all (`site.clinicAvailable`).
- **Service areas** — suburbs and postcodes are invented (`src/content/service-areas.ts`).
- **Booking policy** — time zone (`Australia/Sydney` assumed), notice period, horizon, hold period.
- **Logo** — the wordmark is text; replace with the client's SVG.
- **Photography** — hero and portraits are labelled placeholders; use licensed images only.
- **Privacy policy and collection notice** — must be written for the real data flows and reviewed.

All appointment data is fictional. Client phone numbers use the `0491 570 xxx` fictional range and emails
use `example.com`.
