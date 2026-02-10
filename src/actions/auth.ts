"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators/user";
import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DEFAULT_ELO } from "@/lib/constants";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function registerUser(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    username: formData.get("username") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    skillLevel: formData.get("skillLevel") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: parsed.data.email }, { username: parsed.data.username }],
    },
  });

  if (existingUser) {
    if (existingUser.email === parsed.data.email) {
      return { success: false, error: "Ten adres email jest już zajęty" };
    }
    return { success: false, error: "Ta nazwa użytkownika jest już zajęta" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      username: parsed.data.username,
      email: parsed.data.email,
      passwordHash,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      name: `${parsed.data.firstName} ${parsed.data.lastName}`,
      skillLevel: parsed.data.skillLevel,
      stats: {
        create: { eloRating: DEFAULT_ELO },
      },
    },
  });

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirect: false,
  });

  redirect("/reservations");
}

export async function loginUser(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch {
    return { success: false, error: "Nieprawidłowy email lub hasło" };
  }

  redirect("/reservations");
}
