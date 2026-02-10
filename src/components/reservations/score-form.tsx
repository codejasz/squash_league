"use client";

import { useState } from "react";
import { submitScore } from "@/actions/scores";

export function ScoreForm({ reservationId }: { reservationId: string }) {
  const [homeSets, setHomeSets] = useState(0);
  const [guestSets, setGuestSets] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await submitScore(reservationId, homeSets, guestSets);
    if (!result.success) {
      setError(result.error ?? "Wystąpił błąd");
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-white p-6 space-y-4"
    >
      <h3 className="font-semibold text-lg">Wpisz wynik meczu</h3>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Sety gospodarza
          </label>
          <select
            value={homeSets}
            onChange={(e) => setHomeSets(Number(e.target.value))}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
          >
            {[0, 1, 2, 3].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Sety gościa
          </label>
          <select
            value={guestSets}
            onChange={(e) => setGuestSets(Number(e.target.value))}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
          >
            {[0, 1, 2, 3].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Wysyłanie..." : "Wyślij wynik"}
      </button>
    </form>
  );
}
