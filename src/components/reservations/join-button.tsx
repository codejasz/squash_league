"use client";

import { useState } from "react";
import { joinReservation } from "@/actions/reservations";

export function JoinButton({ reservationId }: { reservationId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    setLoading(true);
    setError(null);
    const result = await joinReservation(reservationId);
    if (!result.success) {
      setError(result.error ?? "Wystąpił błąd");
    }
    setLoading(false);
  }

  return (
    <div>
      <button
        onClick={handleJoin}
        disabled={loading}
        className="w-full rounded-md bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Dołączanie..." : "Dołącz do gry"}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
