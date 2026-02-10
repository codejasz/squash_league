import { z } from "zod";

export const submitScoreSchema = z.object({
  reservationId: z.string().min(1),
  homeSetsWon: z.number().int().min(0).max(3),
  guestSetsWon: z.number().int().min(0).max(3),
});

export const confirmScoreSchema = z.object({
  matchResultId: z.string().min(1),
  confirmed: z.boolean(),
});

export type SubmitScoreInput = z.infer<typeof submitScoreSchema>;
export type ConfirmScoreInput = z.infer<typeof confirmScoreSchema>;
