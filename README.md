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
```

Create a local `.env.local` from `.env.example` and add a classic or fine-grained
token only if needed. The token is read only on the server and is never exposed
to client components.

`NEXT_PUBLIC_SITE_URL` is used for metadata alternates and hreflang URLs. Keep
the localhost value for development only, and set the production origin when the
real domain is available.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run format
npm run format:check
npm run validate:translations
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
- `lib/mini-game`: Type-safe Packet Route step order and route selection helpers.
- `messages`: Translation message files for all supported locales.
- `scripts/validate-translations.mjs`: Checks locale files against the English message schema.
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

All Download CV buttons point to `/documents/emir-yilmaz-cv.pdf`.

## TODO

- Add the CV PDF file to `public/documents/emir-yilmaz-cv.pdf`.
- Graphic Design education details require confirmation.
- Microsoft certification title and verification details require confirmation.
- Review AI-assisted translations with native speakers or a human reviewer.
- Add optional `portfolio.json` metadata support for richer repo-specific overrides.
- Add contact form backend.
- Add chatbot.
- Add lightweight tests for Packet Route route order, reset, wrong route, and
  localStorage fallback behavior.
