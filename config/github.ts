export const githubConfig = {
  apiBaseUrl: "https://api.github.com",
  apiVersion: "2022-11-28",
  username: "Emiryz-162",
  revalidateSeconds: 3600,
  userAgent: "emir-yilmaz-portfolio",
} as const;

export const portfolioTopics = {
  hidden: "portfolio-hidden",
  featured: "portfolio-featured",
  categories: {
    fullstack: "portfolio-fullstack",
    frontend: "portfolio-frontend",
    backend: "portfolio-backend",
    game: "portfolio-game",
    tool: "portfolio-tool",
    experiment: "portfolio-experiment",
  },
} as const;
