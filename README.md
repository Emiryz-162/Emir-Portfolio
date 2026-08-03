# Emir Portfolio

Modern, responsive, multilingual personal portfolio for Emir Yılmaz.

The project uses the Concept A - Digital Workbench design direction: minimal, technical, personal, and prepared for future GitHub, chatbot, and portfolio interaction improvements.

## Stack

- Next.js App Router
- TypeScript
- TailwindCSS
- next-intl
- next-themes
- Framer Motion
- react-markdown
- remark-gfm
- Resend
- clsx
- tailwind-merge
- ESLint
- Prettier

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000/en`.

## Environment

GitHub data is fetched server-side from public endpoints. A token is optional,
but recommended for a higher GitHub API rate limit:

```bash
GITHUB_TOKEN=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RESEND_API_KEY=
CONTACT_EMAIL_TO=yz.emir@hotmail.com
CONTACT_EMAIL_FROM=
```

Create a local `.env.local` from `.env.example` and add a classic or fine-grained
token only if needed. The token is read only on the server and is never exposed
to client components.

`NEXT_PUBLIC_SITE_URL` is used for metadata alternates, hreflang, sitemap,
robots, Open Graph URLs, and Twitter image URLs. Keep the localhost value for
development only. Production should use `https://emir-portfolio-nine.vercel.app`.

The contact form sends email through Resend from a server action. Add a Resend
API key and a verified sender address in `CONTACT_EMAIL_FROM`; production
domains should be verified in Resend before using a custom sender. Missing
contact environment variables do not break the whole site. The form shows a
localized unavailable message and keeps a direct email fallback visible. Secret
values are read only on the server and are never sent to client components.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run format
npm run format:check
npm run validate:translations
npm run validate:encoding
npm run validate:production
```

## Architecture

- `app/[locale]`: Locale-based App Router pages.
- `components/layout`: Navbar, footer, theme toggle, and language switcher.
- `components/mini-game`: The Packet Route homepage mini game.
- `components/projects`: Client-side project search, filtering, sorting, and empty states.
- `components/ui`: Shared primitives such as button, card, badge, section header, and social button.
- `components/sections`: Homepage and reusable page sections.
- `config/github.ts`: GitHub username, API version, cache timing, and portfolio topic conventions.
- `data`: Central profile, navigation, social link, project, skill, and experience data.
- `i18n`: Locale routing, request config, and navigation wrappers.
- `lib/github`: GitHub REST client, repository mapping, language stats, README fetching, and Markdown URL resolution.
- `lib/contact`: Contact form validation, environment lookup, email rendering, and rate limiting.
- `lib/mini-game`: Type-safe Packet Route step order and route selection helpers.
- `lib/seo`: Person and WebSite JSON-LD data.
- `messages`: Translation message files for all supported locales.
- `scripts/validate-translations.mjs`: Checks locale files against the English message schema.
- `scripts/validate-production.mjs`: Checks production readiness conventions that do not require secrets.
- `types`: Shared TypeScript domain types.

## Internationalization

Default locale is English (`en`). Supported routes are `/en`, `/tr`, `/de`,
`/fr`, `/es`, `/it`, `/pt`, `/nl`, and `/pl`. Portuguese copy is written for
European Portuguese while keeping the `pt` locale code.

The language switcher keeps the current page, query string and hash when
switching languages. For example, `/en/projects?category=backend` becomes
`/tr/projects?category=backend`. next-intl handles the lightweight
`NEXT_LOCALE` preference cookie when a user chooses a language.

The menu includes a small note that translations were created with AI
assistance. These translations can be reviewed by a human later, but the UI does
not claim that review has already happened.

GitHub repository names, descriptions, topics, programming languages, license
names, README files and `portfolio.md` content are not translated. They are
shown in the original language so technical project information stays accurate.

When adding a new locale, update `i18n/routing.ts`, add `messages/{locale}.json`
with the same shape as `messages/en.json`, then run
`npm run validate:translations`.

## Packet Route

Packet Route is a small homepage mini game inside the hero system-flow area. It
keeps the original Full Stack flow visible while making it interactive:

```text
Client -> Frontend -> API -> Database -> Deploy
```

The player clicks, taps, or tabs through real button nodes in that order. A
correct choice advances a small packet indicator and marks the node complete.
An incorrect choice shows a short, non-punitive `400 - Wrong route` style
message without resetting progress. Completion shows an inline achievement:
`200 OK`, `Deployment successful`, and `Portfolio Explorer unlocked`.

The game never locks portfolio content. The normal hero projects button remains
available, and the game includes a skip/view projects action.

Completion is remembered with the device-local boolean key
`portfolio-packet-route-completed`. If `localStorage` is unavailable, the game
still works normally and stores nothing.

Reduced motion is respected: packet movement and reveal transitions are skipped
when the user prefers reduced motion. Mobile interaction uses sequential taps,
not drag-and-drop, so the nodes remain usable on narrow screens. Keyboard users
can tab through nodes and activate them with Enter or Space.

Small micro interactions are intentionally limited to active navigation
feedback, button press movement, project card hover lift, tech badge hover
states, social button movement, timeline focus/hover emphasis, language menu
transitions, and a subtle theme icon transition. No audio, haptics, analytics,
custom cursor, chatbot, AI API, canvas engine, or leaderboard is included.

## GitHub Portfolio Data

The portfolio reads public repositories for `Emiryz-162` with server-side
Next.js `fetch` calls and a one-hour revalidation window. Client components only
receive mapped portfolio project data; they do not call GitHub directly.

Repositories are excluded when they are private, forks, disabled, the profile
repository, common config/dotfile repositories, empty config-style repositories,
or tagged with `portfolio-hidden`.

Supported GitHub topics:

- `portfolio-hidden`: hide from the portfolio.
- `portfolio-featured`: prefer on the homepage featured grid.
- `portfolio-fullstack`, `portfolio-frontend`, `portfolio-backend`,
  `portfolio-game`, `portfolio-tool`, `portfolio-experiment`: project category
  hints.

Project detail pages fetch repository languages and Markdown content. Markdown
uses `portfolio.md` first, then the repository README, then the repository
description. Raw HTML is not enabled in Markdown rendering, and relative README
links/images are rewritten to GitHub-safe URLs.

`portfolio.json` support is intentionally scoped for later. The current service
layer already has typed configuration hooks so repo-level metadata can be added
without changing page components.

## Completed In This Phase

- Real profile information
- Real social links
- CV download path
- Skills content
- Education content
- Internship content
- Certification training content
- Spoken language levels
- About, Skills, Education, and Contact pages
- Server-side GitHub repository integration
- Project index with search, filters, sorting, empty states, and unavailable states
- Dynamic project detail pages with README/portfolio Markdown, language stats, and metadata
- Real locale files for English, Turkish, German, French, Spanish, Italian,
  European Portuguese, Dutch, and Polish
- Accessible language switcher with current-page locale switching
- Translation validation script
- Packet Route mini game in the homepage hero system-flow area
- Reduced-motion-aware reveal and micro interactions
- CV availability-aware links
- Resend-backed localized contact form with server validation
- Sitemap, robots, manifest, generated icons, Open Graph image, JSON-LD, and
  security headers

## Current Routes

- `/en`
- `/en/projects`
- `/en/projects/[slug]`
- `/en/about`
- `/en/skills`
- `/en/education`
- `/en/contact`

Default locale is English. Supported locales are Turkish, English, German, French, Spanish, Italian, European Portuguese, Dutch, and Polish.

## CV

Add the CV PDF file to:

```text
public/documents/emir-yilmaz-cv.pdf
```

The live UI does not currently render CV download buttons. Header and hero
actions point users to the localized Contact page instead, so a missing PDF
cannot create a broken visitor-facing link. The central CV path remains in the
profile data for a future dedicated CV phase.

## Contact Form

The contact form lives only on the Contact page and uses a Next.js App Router
server action with the official `resend` package. Fields are limited to name,
email, subject, and message; phone number, company, file upload, accounts, admin
features, database storage, analytics, CAPTCHA, and chatbot functionality are
not included.

Validation runs on the server with shared limits: name 2-80 characters, email
required with a basic email format and 254 character limit, subject 3-120
characters, and message 20-3000 characters. Client validation is present only
for user experience.

Spam protection is intentionally lightweight: a visually hidden honeypot, a
minimum submit time check, and in-memory server-side rate limiting. The memory
rate limit is useful as a first guard but is not distributed or persistent in
serverless deployments. Redis, a database-backed limiter, Turnstile, or
reCAPTCHA can be evaluated later if traffic requires it.

Form data is not saved to a database. It is used to send the Resend email and to
reply to the sender. User-provided content is escaped before HTML email output,
and the user email is used as `Reply-To`, not as the sender.

## SEO And Production Metadata

The site uses the Next.js Metadata API for localized page titles, descriptions,
canonical URLs, hreflang alternates, Open Graph, and Twitter card metadata.
`NEXT_PUBLIC_SITE_URL` is the single production origin source; if it is missing
or points to localhost during production, canonical URL generation is skipped
instead of publishing localhost URLs.

Metadata routes provide:

- `app/sitemap.ts`: Locale-aware sitemap for static pages and available public
  project detail pages. GitHub failures are handled without crashing the route.
- `app/robots.ts`: Allows public routes in production, blocks API/internal
  paths, and disallows indexing in development/preview.
- `app/opengraph-image.tsx`: Code-generated Concept A Open Graph image.
- `app/icon.tsx` and `app/apple-icon.tsx`: Minimal generated EY icons.
- `app/manifest.ts`: Basic web app metadata without service worker, offline
  mode, install prompt, or push notifications.

The homepage renders static Person and WebSite JSON-LD with confirmed profile
information only: name, alternate name, job title, Istanbul/Turkiye location,
site URL, GitHub, and LinkedIn. Phone number, birth date, employer, awards, and
unconfirmed claims are not included.

## Security Headers

`next.config.ts` adds conservative headers:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` disabling camera, microphone, geolocation, payment, USB,
  magnetometer, and gyroscope
- `X-Frame-Options: DENY`

A Content Security Policy is intentionally left as a production security TODO
because it should be tested against Next.js development/HMR behavior, Vercel,
remote GitHub README images, Resend server actions, generated Open Graph routes,
and final image domains before enforcement.

## Production Checklist

- Set `NEXT_PUBLIC_SITE_URL` to the production origin.
- Verify the Resend sender domain or sender address.
- Add `RESEND_API_KEY`, `CONTACT_EMAIL_TO`, and `CONTACT_EMAIL_FROM`.
- Add `GITHUB_TOKEN` if higher GitHub API rate limits are needed.
- Run `npm run validate:translations`.
- Run `npm run validate:production`.
- Run `npm run lint`.
- Run `npm run format:check`.
- Run `npm run build`.
- Check `/sitemap.xml`, `/robots.txt`, `/opengraph-image`, and page metadata.
- Test the contact form unavailable fallback without a real API key before live
  email testing.
- Review AI-assisted translations with native speakers or a human reviewer.
- Keep chatbot, AI API, analytics, database storage, service worker,
  newsletter, authentication, and admin panel work for later phases only if
  explicitly requested.

## TODO

- Decide whether a future CV phase should reintroduce a download action after
  adding `public/documents/emir-yilmaz-cv.pdf`.
- Graphic Design education details require confirmation.
- Microsoft certification title and verification details require confirmation.
- Review AI-assisted translations with native speakers or a human reviewer.
- Add optional `portfolio.json` metadata support for richer repo-specific overrides.
- Add lightweight tests for Packet Route route order, reset, wrong route, and
  localStorage fallback behavior.
- Evaluate a production-tested Content Security Policy after the final hosting
  and image domains are known.
