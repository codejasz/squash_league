"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { loginUser, type ActionResult } from "@/actions/auth";

const initialState: ActionResult = { success: false };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginUser, initialState);

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Trophy className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Zaloguj się</h1>
          <p className="text-gray-500 mt-2">
            Wróć do swojej ligi squasha
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {pending ? "Logowanie..." : "Zaloguj się"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Nie masz konta?{" "}
          <Link href="/register" className="text-emerald-600 font-medium hover:underline">
            Zarejestruj się
          </Link>
        </p>
      </div>
    </div>
  );
}
