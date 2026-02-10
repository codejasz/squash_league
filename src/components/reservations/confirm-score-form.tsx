"use client";

import { useState } from "react";
import { confirmScore } from "@/actions/scores";

export function ConfirmScoreForm({
  matchResultId,
  homeSetsWon,
  guestSetsWon,
  homePlayerName,
  guestPlayerName,
}: {
  matchResultId: string;
  homeSetsWon: number;
  guestSetsWon: number;
  homePlayerName: string;
  guestPlayerName: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm(confirmed: boolean) {
    setLoading(true);
    setError(null);
    const result = await confirmScore(matchResultId, confirmed);
    if (!result.success) {
      setError(result.error ?? "Wystąpił błąd");
    }
    setLoading(false);
  }

  return (
    <div className="rounded-xl border bg-white p-6 space-y-4">
      <h3 className="font-semibold text-lg">Potwierdź wynik meczu</h3>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="text-center py-4">
        <div className="text-3xl font-bold mb-2">
          {homeSetsWon} : {guestSetsWon}
        </div>
        <div className="text-sm text-gray-500">
          {homePlayerName} vs {guestPlayerName}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleConfirm(true)}
          disabled={loading}
          className="rounded-md bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "..." : "Potwierdzam"}
        </button>
        <button
          onClick={() => handleConfirm(false)}
          disabled={loading}
          className="rounded-md border border-red-300 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {loading ? "..." : "Kwestionuję"}
        </button>
      </div>
    </div>
  );
}
