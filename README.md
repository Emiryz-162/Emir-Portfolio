# Emir Portfolio

Modern, responsive, multilingual-ready personal portfolio for Emir Yılmaz.

The project uses the Concept A - Digital Workbench design direction: minimal, technical, personal, and prepared for future GitHub, chatbot, mini game, and multilingual improvements.

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
```

Create a local `.env.local` from `.env.example` and add a classic or fine-grained
token only if needed. The token is read only on the server and is never exposed
to client components.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run format
npm run format:check
```

## Architecture

- `app/[locale]`: Locale-based App Router pages.
- `components/layout`: Navbar, footer, theme toggle, and language switcher.
- `components/projects`: Client-side project search, filtering, sorting, and empty states.
- `components/ui`: Shared primitives such as button, card, badge, section header, and social button.
- `components/sections`: Homepage and reusable page sections.
- `config/github.ts`: GitHub username, API version, cache timing, and portfolio topic conventions.
- `data`: Central profile, navigation, social link, project, skill, and experience data.
- `i18n`: Locale routing, request config, and navigation wrappers.
- `lib/github`: GitHub REST client, repository mapping, language stats, README fetching, and Markdown URL resolution.
- `messages`: Translation message files. English is filled; other locales currently mirror English.
- `types`: Shared TypeScript domain types.

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

## Current Routes

- `/en`
- `/en/projects`
- `/en/projects/[slug]`
- `/en/about`
- `/en/skills`
- `/en/education`
- `/en/contact`

Default locale is English. Supported locale placeholders are Turkish, English, German, French, Spanish, Italian, Portuguese, Polish, and Dutch.

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
- Add real translations for non-English locales.
- Add optional `portfolio.json` metadata support for richer repo-specific overrides.
- Add contact form backend.
- Add mini game.
- Add chatbot.
