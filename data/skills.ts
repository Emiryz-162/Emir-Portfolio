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
    items: [
      "Microsoft SQL Server",
      "CRUD Operations",
      "SQL",
      "Database Design",
    ],
  },
  {
    key: "gameDevelopment",
    items: ["Unity 2D", "Godot"],
  },
  {
    key: "toolsAndTechnologies",
    items: ["Git", "GitHub", "Visual Studio", "Visual Studio Code"],
  },
  {
    key: "professionalSkills",
    items: [
      "Problem Solving",
      "Algorithmic Thinking",
      "Teamwork",
      "Communication",
      "Project-Based Work Discipline",
    ],
  },
];

export const currentStackGroups = [
  {
    key: "frontend",
    items: ["HTML5", "CSS3", "JavaScript"],
  },
  {
    key: "backend",
    items: ["C#", "ASP.NET Core", "REST API"],
  },
  {
    key: "database",
    items: ["SQL Server"],
  },
  {
    key: "gameDevelopment",
    items: ["Unity 2D", "Godot"],
  },
] as const;
