import type { SkillLevel } from "@prisma/client";

export const SKILL_LEVELS: Record<
  SkillLevel,
  { label: string; description: string; color: string }
> = {
  BEGINNER: {
    label: "Szturmowiec",
    description: "Początkujący",
    color: "bg-green-100 text-green-800",
  },
  INTERMEDIATE: {
    label: "Padawan",
    description: "Średniozaawansowany",
    color: "bg-blue-100 text-blue-800",
  },
  ADVANCED: {
    label: "Rycerz Jedi",
    description: "Zaawansowany",
    color: "bg-purple-100 text-purple-800",
  },
  EXPERT: {
    label: "Mistrz Yoda",
    description: "Ekspert",
    color: "bg-amber-100 text-amber-800",
  },
};

export const RESERVATION_STATUSES = {
  OPEN: { label: "Otwarta", color: "bg-green-100 text-green-800" },
  CONFIRMED: { label: "Potwierdzona", color: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "Zakończona", color: "bg-gray-100 text-gray-800" },
  CANCELLED: { label: "Anulowana", color: "bg-red-100 text-red-800" },
} as const;

export const DEFAULT_ELO = 1200;
export const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => {
  const hour = i + 8;
  return `${hour.toString().padStart(2, "0")}:00`;
});
