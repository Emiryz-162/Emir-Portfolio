# Emir Portfolio

Modern, responsive, multilingual-ready personal portfolio foundation for Muhammet Emir Yilmaz.

This first phase focuses on architecture and a clean UI skeleton. Real project content, GitHub API, chatbot, mini game, advanced animations, and production CV data are intentionally left out.

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

Open `http://localhost:3000`.

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
- `components/layout`: Shared layout pieces such as navbar, footer, theme toggle, and language switcher.
- `components/ui`: Reusable primitives such as button, card, badge, container, and heading.
- `components/sections`: Page-level composition blocks.
- `i18n`: Locale routing, request config, and navigation wrappers for `next-intl`.
- `messages`: Translation message files. They are intentionally empty placeholders for now.
- `lib`: Shared helpers and static navigation config.
- `hooks`: Reusable client hooks.
- `types`: Shared TypeScript domain types.
- `styles`: Central style-related constants for future expansion.

## Current Routes

- `/en`
- `/en/projects`
- `/en/projects/[slug]`
- `/en/about`
- `/en/skills`
- `/en/education`
- `/en/contact`

Default locale is English. Supported locale placeholders are Turkish, English, German, French, Spanish, Italian, Portuguese, Polish, and Dutch.

## TODO

- Add real portfolio content.
- Add translations to the message files.
- Connect GitHub API when project data is ready.
- Add chatbot architecture and UI.
- Add mini game route or embedded experience.
- Add real CV download asset.
- Add advanced animations with Framer Motion.
