import type { SkillGroup } from "@/types/skill";

export const skillGroups: SkillGroup[] = [
  {
    key: "frontend",
    items: [
      "html5",
      "css3",
      "javascript",
      "responsiveWebDesign",
      "basicUiUxPrinciples",
    ],
  },
  {
    key: "backend",
    items: ["csharp", "aspnetCore", "restApiDevelopment"],
  },
  {
    key: "database",
    items: ["sqlServer", "crudOperations", "sql", "databaseDesign"],
  },
  {
    key: "gameDevelopment",
    items: ["unity2d", "godot"],
  },
  {
    key: "toolsAndTechnologies",
    items: ["git", "github", "visualStudio", "visualStudioCode"],
  },
  {
    key: "professionalSkills",
    items: [
      "problemSolving",
      "algorithmicThinking",
      "teamwork",
      "communication",
      "projectDiscipline",
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
