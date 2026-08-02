import type { SkillGroup } from "@/types/skill";

export const skillGroups: SkillGroup[] = [
  {
    key: "frontend",
    items: [
      "HTML5",
      "CSS3",
      "JavaScript",
      "Responsive Web Design",
      "Basic UI/UX Principles",
    ],
  },
  {
    key: "backend",
    items: ["C#", "ASP.NET Core", "RESTful API Development"],
  },
  {
    key: "database",
    items: ["Microsoft SQL Server", "CRUD Operations", "SQL / Database Design"],
  },
  {
    key: "tools",
    items: ["Git", "GitHub", "Visual Studio", "VS Code"],
  },
  {
    key: "gameDevelopment",
    items: ["Unity 2D", "Godot"],
  },
];

export const currentStackGroups = [
  {
    key: "frontend",
    items: ["HTML5", "CSS3", "JavaScript"],
  },
  {
    key: "backend",
    items: ["C#", "ASP.NET Core", "RESTful API"],
  },
  {
    key: "database",
    items: ["Microsoft SQL Server", "CRUD Operations", "Database Design"],
  },
  {
    key: "gameDevelopment",
    items: ["Unity 2D", "Godot"],
  },
] as const;
