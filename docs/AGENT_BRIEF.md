# Nix Academy Mobile — Screen Builder Brief

You are building **one screen** of a AAA-quality bilingual (Arabic-first, RTL)
learning app. Match the foundation exactly. **Do not** touch other screens,
shared libs, or config. Only create/edit **your screen's files**.

## The bar: AAA
This must look and feel like a top-tier App Store app (think Duolingo / Apple
polish), not a bootstrap CRUD screen. Every screen must have:
- Real visual hierarchy, generous spacing, and rhythm — never cramped.
- Motion: entrance transitions (`motion/react`), spring press on tappables,
  skeleton loading states (never a bare spinner for whole screens).
- Depth: use the provided glass / shadow / gradient / grain utilities tastefully.
- Perfect RTL: use logical props (ps/pe/ms/me/start/end), never left/right.
- Empty, loading, and error states — all designed, all bilingual.
- Thumb-friendly targets (≥44px), safe-area aware.
- Zero layout shift, no horizontal overflow at 390px width.

## Stack & conventions
- Vite + React + TS + Tailwind v4 + React Router + TanStack Query + Capacitor.
- Path alias `@/` → `src/`.
- **i18n**: no shared dictionary. Each screen declares its own strings and uses
  `useT`:
  ```ts
  import { useT, useLocale, localized } from '@/lib/i18n';
  const strings = { title: { en: 'Explore', ar: 'استكشف' } };
  const t = useT(strings);
  t('title'); // and t('greet', { name }) for {name} interpolation
  ```
  For API rows with `titleI18n` / `descriptionI18n`: `localized(row, 'title', locale)`.
- **Never hardcode English or Arabic in JSX** — always go through `t(...)`.

## Design system (already built — import, don't reinvent)
- Colors (Tailwind tokens): `primary` (amber/gold), `money` (amber), `success`
  (emerald), `destructive`, `foreground`, `muted-foreground`, `card`, `border`,
  `background`. Dark-first.
- Utilities in `index.css`: `.glass`, `.grain`, `.aurora`, `.shadow-premium`,
  `.shadow-card`, `.shadow-glow`, `.text-gold`, `.text-gradient`, `.press`,
  `.no-scrollbar`, `.pt-safe`, `.pb-safe`, `.tabular-nums`.
- Radii: `rounded-xl` / `rounded-2xl` / `rounded-3xl`. Font: Tajawal (default).
- Components:
  - `@/components/ui/button` → `<Button variant="primary|gold|secondary|outline|ghost|destructive" size="sm|md|lg|icon" loading>`
  - `@/components/ui/card` → `<Card>` `<CardBody>`
  - `@/components/ui/input` → `<Input label hint error leading trailing />`
  - `@/components/ui/misc` → `Badge`, `Skeleton`, `Spinner`, `Progress`, `Avatar`, `EmptyState`, `Divider`
  - `@/components/ui/toast` → `const toast = useToast(); toast.show(msg, 'success'|'error'|'info')`
  - `@/components/layout/AppBar` → `<AppBar title back actions />`
  - `@/components/layout/Screen` → `<Screen>` (scroll body; pads for tab bar)
  - `@/components/course/CourseCard` → `<CourseCard c={listing} />`
  - `@/components/brand/logo` → `LogoMark`, `Wordmark`
- Native: `import { tapLight, tapMedium } from '@/lib/native'` for haptics.
- A screen typically renders `<><AppBar .../><Screen>…</Screen></>`.

## Data / API
- Client: `import { api, fileUrl, session } from '@/lib/api'`.
  `api.get/post/patch/del`. Auth token + `x-tenant-id` are already attached
  globally after login — just call endpoints. `fileUrl(key)` → absolute media URL.
- Types: `import type { Listing, CourseDetail, CourseTree, CourseProgress, Quote } from '@/lib/types'`.
- Use TanStack Query (`useQuery`, `useMutation`) with `queryClient`.
- Endpoints (base is proxied to prod in dev):
  - Browse: `GET /marketplace/courses` → `Listing[]` (also `?q=`, `?category=`).
  - Detail: `GET /marketplace/courses/:courseId` → `CourseDetail` (has `curriculum`).
  - Quote: `POST /marketplace/orders/quote` `{ items:[{courseId, couponCode?}] }` → `Quote`.
  - Order: `POST /marketplace/orders` `{ email, locale, items:[{courseId, couponCode?}] }`
    → `{ ref, redirectUrl, totalCents }` (redirect → gateway; else go to success).
  - My courses: `GET /communities` → `[{id,...}]`; per community `GET /communities/:id/courses`
    → `Course[]`; progress `GET /courses/:id/progress` → `CourseProgress`.
  - Course tree (owned): `GET /courses/:id` → `CourseTree`; lesson `GET /lessons/:id`;
    complete `POST /lessons/:id/complete`; lesson statuses `GET /courses/:id/lesson-progress` → `Record<lessonId,'COMPLETED'>`.
  - Profile: `GET /me/profile` → `{ email, ... }`.
- Money: `import { money, discountPct, clock } from '@/lib/format'`.

## Seeing real data (for your own testing only — do NOT commit screenshots)
Dev server proxies to the real backend. Log in as the seeded student:
workspace `nix-academy`, email `studnts@yopmail.com`, password `Admin@12345`.
Owned course id: `cmt65d8ho000pl601qlte4rko` (52 lessons). Course ids from browse.

## Verify before you finish
- `npx tsc --noEmit -p tsconfig.app.json` must pass for your file(s).
- No `left-`/`right-` classes; no raw hex colors; no untranslated strings.
