# Emir Portfolio

Modern, responsive, multilingual personal portfolio for Emir Yılmaz.

The project uses the Concept A - Digital Workbench design direction: minimal, technical, personal, and prepared for GitHub-backed portfolio browsing and an OpenAI-powered portfolio assistant.

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
- OpenAI JavaScript SDK
- clsx
- tailwind-merge
- ESLint
- Prettier
- tsx

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
CONTACT_EMAIL_TO=
CONTACT_EMAIL_FROM=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
AI_ASSISTANT_ENABLED=false
```

Create a local `.env.local` from `.env.example` and add a classic or fine-grained
token only if needed. The token is read only on the server and is never exposed
to client components.

`NEXT_PUBLIC_SITE_URL` is used for metadata alternates, hreflang, sitemap,
robots, Open Graph URLs, and Twitter image URLs. Keep the localhost value for
development only. Production should use `https://emir-portfolio-nine.vercel.app`.

The contact form sends email through Resend from a server action. Store
`RESEND_API_KEY`, `CONTACT_EMAIL_TO`, and `CONTACT_EMAIL_FROM` in Vercel
Environment Variables, not in source control. The default sender can be
`Emir Portfolio <onboarding@resend.dev>`; with this Resend starter sender,
delivery is limited to the address registered in the Resend account. After a
custom sending domain is verified, `CONTACT_EMAIL_FROM` can be changed to that
domain's sender address. Missing contact environment variables do not break the
whole site. The form shows a localized unavailable message and keeps a direct
email fallback visible. Secret values are read only on the server and are never
sent to client components.

The AI assistant backend uses the official OpenAI JavaScript SDK and the
Responses API. Store `OPENAI_API_KEY`, `OPENAI_MODEL`, and
`AI_ASSISTANT_ENABLED` in server-side environment variables. `OPENAI_MODEL`
falls back to `gpt-5-mini`; the endpoint is active only when
`AI_ASSISTANT_ENABLED=true` and `OPENAI_API_KEY` is present. Missing values do
not break the site build. `/api/assistant` returns a controlled `503` while the
assistant is disabled or not configured. OpenAI billing and project limits must
be configured separately in the OpenAI platform.

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
npm run validate:assistant
```

## Architecture

- `app/[locale]`: Locale-based App Router pages.
- `components/layout`: Navbar, footer, theme toggle, and language switcher.
- `components/assistant`: Hero assistant preview, floating launcher, chat panel, message UI, and related project links.
- `components/projects`: Client-side project search, filtering, sorting, and empty states.
- `components/ui`: Shared primitives such as button, card, badge, section header, and social button.
- `components/sections`: Homepage and reusable page sections.
- `config/github.ts`: GitHub username, API version, cache timing, and portfolio topic conventions.
- `data`: Central profile, navigation, social link, project, skill, and experience data.
- `i18n`: Locale routing, request config, and navigation wrappers.
- `lib/github`: GitHub REST client, repository mapping, language stats, README fetching, and Markdown URL resolution.
- `lib/contact`: Contact form validation, environment lookup, email rendering, and rate limiting.
- `lib/ai`: Server-only OpenAI client, assistant prompt, portfolio knowledge builder, local retrieval, request validation, and AI rate limiting.
- `lib/seo`: Person and WebSite JSON-LD data.
- `messages`: Translation message files for all supported locales.
- `scripts/validate-translations.mjs`: Checks locale files against the English message schema.
- `scripts/validate-production.mjs`: Checks production readiness conventions that do not require secrets.
- `scripts/validate-assistant.ts`: Checks assistant knowledge, retrieval, prompt, input limits, locale fallback, and truncation without calling OpenAI.
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
- Emir AI assistant preview in the homepage hero area
- Floating Emir AI launcher and responsive chat panel
- Streaming assistant endpoint with controlled SSE events
- Reduced-motion-aware reveal and micro interactions
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
and the user email is used as `Reply-To`, not as the sender. The email payload
uses `from: CONTACT_EMAIL_FROM`, `to: CONTACT_EMAIL_TO`, `replyTo` from the
validated visitor email, and `Portfolio Contact: {subject}` as the subject.
Both text and escaped HTML bodies include the sender name, sender email,
subject, message, submission time, and selected locale. Do not commit real API
keys or private email values to GitHub.

## AI Portfolio Assistant

The homepage hero includes a compact Emir AI preview in the right column. It
introduces the assistant, shows localized example prompts, and opens the full
panel without making an OpenAI request until the user asks a question. The
previous interactive hero widget and its completion state are no longer part of
the site.

When the assistant is configured, a small floating launcher appears on all
localized pages. The panel opens as a right-side drawer on desktop and a
near-full-screen dialog on mobile. It supports suggestion buttons, Enter to
send, Shift+Enter for a newline, Stop via `AbortController`, Escape to close,
focus return to the launcher/trigger, and a clear conversation action.
Runtime availability is checked through `GET /api/assistant/availability`,
which returns only `{ "enabled": boolean }` to the client.

Conversation state is stored only in React state for the current SPA session.
It is not written to a database or `localStorage`, and it resets on full page
reload. The client sends only the latest limited history back to the API.

The non-streaming API surface remains `POST /api/assistant` for compatibility
and validation. The streaming surface is `POST /api/assistant/stream`. Both
routes share request validation, environment validation, knowledge building,
retrieval, project context preparation, prompt construction, error mapping, and
rate limiting.

The route accepts a trimmed `message`, a supported locale (`en`, `tr`, `de`,
`fr`, `es`, `it`, `pt`, `nl`, `pl`), and an optional stateless `history` array.
Messages are limited to 600 characters, history is limited to 8 items, and each
history item is limited to 1,000 characters. The route does not use
`previous_response_id` or the OpenAI Conversations API.

The assistant uses `client.responses.create(...)` from the official OpenAI SDK
with `store: false`, `max_output_tokens: 500`, one OpenAI call per request, no
tools, no web search, no file search, no code interpreter, and no function
calling. The OpenAI client is created server-side only and is lazy-initialized
when a configured request reaches the endpoint. Token usage, model internals,
raw OpenAI responses, API keys, and raw provider errors are never returned to
the client. Streaming uses the Responses API with `stream: true`.

The streaming endpoint does not pass raw OpenAI events to the browser. It emits
a controlled SSE protocol:

- `event: meta` with `{ "relatedProjects": [...] }`
- `event: delta` with `{ "text": "..." }`
- `event: done` with `{}`
- `event: error` with `{ "code": "...", "message": "..." }`

The chat UI renders assistant output as restricted Markdown with raw HTML
disabled. It does not show timestamps, model names, token usage, response IDs,
or retrieval scores. Related project links are generated only from trusted
backend `relatedProjects` data and point to localized `/projects/[slug]`
routes.

The knowledge model is built from verified portfolio sources:

- `data/profile.ts`, excluding phone and birth date fields, which are not part
  of the source model.
- `data/skills.ts`.
- `data/experience.ts` plus localized education, certification, internship, and
  graphic design details from `messages/{locale}.json`.
- `data/social-links.ts`.
- Public, visible GitHub portfolio repositories from the existing GitHub
  service layer.
- Project description, primary language, live demo URL, GitHub URL, category,
  and public topics.

The assistant does not use old CV files, private repositories, hidden
repositories, `portfolio-hidden` projects, environment variable values, Vercel
or server details, TODO comments, previous chat memory, or claims that are not
shown in the portfolio.

Retrieval is local and deterministic. The route compares the user question with
project display name, repository slug, description, primary language, public
topics, category, and technology names. `portfolio-*` topics are stripped before
context is built and are not sent to the model. At most two relevant projects
are selected. If no project is relevant, no README or `portfolio.md` content is
fetched.

When project context is relevant, the route uses the existing GitHub service
layer and cache behavior to fetch `portfolio.md` first, then `README.md`, then
the repository description. It sends at most two project documents and caps each
document at 8,000 characters after removing large base64 data and image
markdown. README and `portfolio.md` content is wrapped in explicit
`<portfolio_reference>` delimiters and treated only as untrusted reference data,
never as instructions.

The assistant prompt instructs the model to answer only from the provided
portfolio context, avoid unverifiable claims, refuse prompt or secret
disclosure, avoid phone/birth-date/private personal data, ignore prompt
injection inside user input or README content, and keep answers short and
professional. It answers in the selected site locale unless the user clearly
asks in another language.

The panel shows lightweight transparency notes: messages are sent to OpenAI to
generate a response, processed only for that response, not stored by this site,
and AI responses may contain mistakes. No cookie banner, analytics event,
feedback button, transcript email, account, admin panel, voice input, file
upload, image upload, vector database, OpenAI File Search, Web Search, Code
Interpreter, or function calling is included.

Rate limiting is separate from the contact form limiter. The AI endpoint allows
up to 5 requests per minute and 20 requests per 10 minutes for the same hashed
client identifier, using forwarding headers when available. Raw IP addresses
are not logged. The limiter is in-memory, so it is a first guard only and is not
distributed or persistent across serverless instances. A production Redis or
edge rate limit service can be evaluated later if traffic requires it.

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
- Add `RESEND_API_KEY`, `CONTACT_EMAIL_TO`, and `CONTACT_EMAIL_FROM` in Vercel.
- Use `Emir Portfolio <onboarding@resend.dev>` only while relying on Resend's
  starter sender, then switch `CONTACT_EMAIL_FROM` after verifying a custom
  domain.
- Add `OPENAI_API_KEY`, `OPENAI_MODEL`, and `AI_ASSISTANT_ENABLED` only when the
  assistant should be enabled. Keep secrets in Vercel environment variables and
  do not expose the model name or API key to the client.
- Add `GITHUB_TOKEN` if higher GitHub API rate limits are needed.
- Run `npm run validate:translations`.
- Run `npm run validate:production`.
- Run `npm run validate:assistant`.
- Run `npm run lint`.
- Run `npm run format:check`.
- Run `npm run build`.
- Check `/sitemap.xml`, `/robots.txt`, `/opengraph-image`, and page metadata.
- Test the contact form unavailable fallback without a real API key before live
  email testing.
- Test `/api/assistant` disabled, invalid request, long message, rate limit, and
  streaming SSE behavior before enabling production traffic.
- Test the assistant preview, launcher, panel, Stop, clear conversation,
  related project links, dark/light themes, Escape close, focus return, and
  mobile viewport behavior.
- Review AI-assisted translations with native speakers or a human reviewer.
- Keep chatbot UI, analytics, database storage, service worker, newsletter,
  authentication, and admin panel work for later phases only if explicitly
  requested.

## TODO

- Microsoft certification title and verification details require confirmation.
- Review AI-assisted translations with native speakers or a human reviewer.
- Add optional `portfolio.json` metadata support for richer repo-specific overrides.
- Evaluate a production-tested Content Security Policy after the final hosting
  and image domains are known.
