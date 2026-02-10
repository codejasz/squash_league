import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SKILL_LEVELS, RESERVATION_STATUSES } from "@/lib/constants";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Plus, MapPin, Clock, User } from "lucide-react";
import { JoinButton } from "@/components/reservations/join-button";
import type { SkillLevel, ReservationStatus } from "@prisma/client";

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ skill?: string; center?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;

  const where: Record<string, unknown> = {
    status: "OPEN",
    date: { gte: new Date(new Date().toDateString()) },
    creatorId: { not: session.user.id },
  };

  if (params.skill && params.skill in SKILL_LEVELS) {
    where.skillLevel = params.skill;
  }

  const reservations = await prisma.reservation.findMany({
    where,
    include: {
      creator: true,
      sportCenter: true,
    },
    orderBy: { date: "asc" },
    take: 50,
  });

  const sportCenters = await prisma.sportCenter.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dostępne rezerwacje</h1>
          <p className="text-gray-500 mt-1">
            Znajdź przeciwnika i dołącz do gry
          </p>
        </div>
        <Link
          href="/reservations/new"
          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nowa rezerwacja
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/reservations"
          className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
            !params.skill
              ? "bg-emerald-600 text-white border-emerald-600"
              : "text-gray-600 border-gray-300 hover:border-emerald-400"
          }`}
        >
          Wszystkie
        </Link>
        {(Object.entries(SKILL_LEVELS) as [SkillLevel, (typeof SKILL_LEVELS)[SkillLevel]][]).map(
          ([key, { label }]) => (
            <Link
              key={key}
              href={`/reservations?skill=${key}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
                params.skill === key
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "text-gray-600 border-gray-300 hover:border-emerald-400"
              }`}
            >
              {label}
            </Link>
          )
        )}
      </div>

      {/* Results */}
      {reservations.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-gray-50">
          <p className="text-gray-500 text-lg">Brak dostępnych rezerwacji</p>
          <p className="text-gray-400 mt-2">
            Stwórz własną rezerwację i czekaj na przeciwnika!
          </p>
          <Link
            href="/reservations/new"
            className="inline-flex items-center gap-2 mt-4 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Stwórz rezerwację
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reservations.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border bg-white p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    SKILL_LEVELS[r.skillLevel as SkillLevel].color
                  }`}
                >
                  {SKILL_LEVELS[r.skillLevel as SkillLevel].label}
                </span>
                <span className="text-sm text-gray-500">
                  {format(new Date(r.date), "d MMM yyyy", { locale: pl })}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {r.sportCenter.name}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4 text-gray-400" />
                  {r.timeStart} - {r.timeEnd}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4 text-gray-400" />
                  {r.creator.firstName} {r.creator.lastName}
                </div>
              </div>

              {r.comment && (
                <p className="text-sm text-gray-500 mb-4 italic">
                  &quot;{r.comment}&quot;
                </p>
              )}

              <JoinButton reservationId={r.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
