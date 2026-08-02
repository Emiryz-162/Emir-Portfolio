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
- `components/ui`: Shared primitives such as button, card, badge, section header, and social button.
- `components/sections`: Homepage and reusable page sections.
- `data`: Central profile, navigation, social link, project, skill, and experience data.
- `i18n`: Locale routing, request config, and navigation wrappers.
- `messages`: Translation message files. English is filled; other locales currently mirror English.
- `types`: Shared TypeScript domain types.

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
- Connect GitHub API when project data is ready.
- Replace placeholder project slots with verified real project data.
- Graphic Design education details require confirmation.
- Microsoft certification title and verification details require confirmation.
- Add real translations for non-English locales.
- Add contact form backend.
- Add mini game.
- Add chatbot.
