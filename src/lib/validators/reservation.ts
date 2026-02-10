import { z } from "zod";

export const createReservationSchema = z
  .object({
    sportCenterId: z.string().min(1, "Wybierz centrum sportowe"),
    date: z.string().min(1, "Wybierz datę"),
    timeStart: z.string().regex(/^\d{2}:\d{2}$/, "Podaj godzinę rozpoczęcia"),
    timeEnd: z.string().regex(/^\d{2}:\d{2}$/, "Podaj godzinę zakończenia"),
    skillLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
    comment: z.string().max(256).optional(),
  })
  .refine(
    (data) => {
      const start = parseInt(data.timeStart.replace(":", ""));
      const end = parseInt(data.timeEnd.replace(":", ""));
      return end > start;
    },
    { message: "Godzina zakończenia musi być po godzinie rozpoczęcia", path: ["timeEnd"] }
  );

export const searchReservationSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sportCenterId: z.string().optional(),
  skillLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT", ""]).optional(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type SearchReservationInput = z.infer<typeof searchReservationSchema>;
