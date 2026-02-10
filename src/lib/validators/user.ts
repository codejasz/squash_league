import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Nazwa użytkownika musi mieć min. 3 znaki")
    .max(30, "Nazwa użytkownika może mieć max. 30 znaków")
    .regex(/^[a-zA-Z0-9_]+$/, "Dozwolone: litery, cyfry i podkreślnik"),
  email: z.string().email("Podaj prawidłowy adres email"),
  password: z
    .string()
    .min(8, "Hasło musi mieć min. 8 znaków")
    .regex(/[A-Z]/, "Hasło musi zawierać wielką literę")
    .regex(/[0-9]/, "Hasło musi zawierać cyfrę"),
  firstName: z.string().min(1, "Imię jest wymagane"),
  lastName: z.string().min(1, "Nazwisko jest wymagane"),
  skillLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
});

export const loginSchema = z.object({
  email: z.string().email("Podaj prawidłowy adres email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

export const editProfileSchema = z.object({
  firstName: z.string().min(1, "Imię jest wymagane"),
  lastName: z.string().min(1, "Nazwisko jest wymagane"),
  skillLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type EditProfileInput = z.infer<typeof editProfileSchema>;
