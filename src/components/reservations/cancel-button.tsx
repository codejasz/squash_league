"use client";

import { useState } from "react";
import { cancelReservation } from "@/actions/reservations";

export function CancelButton({ reservationId }: { reservationId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm("Czy na pewno chcesz anulować tę rezerwację?")) return;
    setLoading(true);
    await cancelReservation(reservationId);
    setLoading(false);
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="mt-4 w-full rounded-md border border-red-300 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
    >
      {loading ? "Anulowanie..." : "Anuluj rezerwację"}
    </button>
  );
}
