"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { registerUser, type ActionResult } from "@/actions/auth";
import { SKILL_LEVELS } from "@/lib/constants";
import type { SkillLevel } from "@prisma/client";

const initialState: ActionResult = { success: false };

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerUser, initialState);

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Trophy className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Dołącz do ligi</h1>
          <p className="text-gray-500 mt-2">
            Stwórz konto i zacznij grać
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-1.5">
                Imię
              </label>
              <input
                id="firstName"
                name="firstName"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-1.5">
                Nazwisko
              </label>
              <input
                id="lastName"
                name="lastName"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1.5">
              Nazwa użytkownika
            </label>
            <input
              id="username"
              name="username"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              placeholder="np. jan_kowalski"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              placeholder="twoj@email.pl"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5">
              Hasło
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              placeholder="Min. 8 znaków, wielka litera i cyfra"
            />
          </div>

          <div>
            <label htmlFor="skillLevel" className="block text-sm font-medium mb-1.5">
              Poziom umiejętności
            </label>
            <select
              id="skillLevel"
              name="skillLevel"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
              defaultValue=""
            >
              <option value="" disabled>
                Wybierz poziom...
              </option>
              {(Object.entries(SKILL_LEVELS) as [SkillLevel, (typeof SKILL_LEVELS)[SkillLevel]][]).map(
                ([key, { label, description }]) => (
                  <option key={key} value={key}>
                    {label} — {description}
                  </option>
                )
              )}
            </select>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {pending ? "Rejestracja..." : "Stwórz konto"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Masz już konto?{" "}
          <Link href="/login" className="text-emerald-600 font-medium hover:underline">
            Zaloguj się
          </Link>
        </p>
      </div>
    </div>
  );
}
