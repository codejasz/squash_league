"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createReservation } from "@/actions/reservations";
import { SKILL_LEVELS, TIME_SLOTS } from "@/lib/constants";
import type { ActionResult } from "@/actions/auth";
import type { SkillLevel } from "@prisma/client";

const initialState: ActionResult = { success: false };

type SportCenterOption = { id: string; name: string };

export default function NewReservationPage() {
  const [state, formAction, pending] = useActionState(
    createReservation,
    initialState
  );
  const [centers, setCenters] = useState<SportCenterOption[]>([]);

  useEffect(() => {
    fetch("/api/sport-centers")
      .then((r) => r.json())
      .then(setCenters)
      .catch(() => {});
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/reservations"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Wróć do listy
      </Link>

      <div className="max-w-lg">
        <h1 className="text-2xl font-bold mb-2">Nowa rezerwacja</h1>
        <p className="text-gray-500 mb-8">
          Stwórz rezerwację i czekaj na przeciwnika
        </p>

        <form action={formAction} className="space-y-5">
          {state.error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <div>
            <label htmlFor="sportCenterId" className="block text-sm font-medium mb-1.5">
              Centrum sportowe
            </label>
            <select
              id="sportCenterId"
              name="sportCenterId"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
              defaultValue=""
            >
              <option value="" disabled>
                Wybierz centrum...
              </option>
              {centers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1.5">
              Data
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="timeStart" className="block text-sm font-medium mb-1.5">
                Od
              </label>
              <select
                id="timeStart"
                name="timeStart"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
                defaultValue=""
              >
                <option value="" disabled>
                  Godzina...
                </option>
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="timeEnd" className="block text-sm font-medium mb-1.5">
                Do
              </label>
              <select
                id="timeEnd"
                name="timeEnd"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
                defaultValue=""
              >
                <option value="" disabled>
                  Godzina...
                </option>
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="skillLevel" className="block text-sm font-medium mb-1.5">
              Szukany poziom przeciwnika
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

          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-1.5">
              Komentarz (opcjonalnie)
            </label>
            <input
              id="comment"
              name="comment"
              maxLength={256}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              placeholder="np. Szukam spokojnej gry treningowej"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {pending ? "Tworzenie..." : "Stwórz rezerwację"}
          </button>
        </form>
      </div>
    </div>
  );
}
