import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { RESERVATION_STATUSES, SKILL_LEVELS } from "@/lib/constants";
import { Calendar, MapPin, Clock, User, Trophy } from "lucide-react";
import Link from "next/link";
import type { SkillLevel, ReservationStatus } from "@prisma/client";

export default async function MyGamesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const upcomingGames = await prisma.reservation.findMany({
    where: {
      OR: [
        { creatorId: session.user.id },
        { partnerId: session.user.id },
      ],
      date: { gte: new Date(new Date().toDateString()) },
      status: { in: ["OPEN", "CONFIRMED"] },
    },
    include: {
      creator: true,
      partner: true,
      sportCenter: true,
    },
    orderBy: { date: "asc" },
  });

  const pastGames = await prisma.reservation.findMany({
    where: {
      OR: [
        { creatorId: session.user.id },
        { partnerId: session.user.id },
      ],
      status: "COMPLETED",
    },
    include: {
      creator: true,
      partner: true,
      sportCenter: true,
      matchResult: true,
    },
    orderBy: { date: "desc" },
    take: 20,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Moje mecze</h1>

      {/* Upcoming */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-emerald-600" />
          Nadchodzące ({upcomingGames.length})
        </h2>

        {upcomingGames.length === 0 ? (
          <div className="text-center py-8 border rounded-xl bg-gray-50">
            <p className="text-gray-500">Brak nadchodzących meczów</p>
            <Link
              href="/reservations"
              className="text-emerald-600 text-sm font-medium hover:underline mt-2 inline-block"
            >
              Przeglądaj dostępne rezerwacje
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingGames.map((g) => {
              const opponent =
                g.creatorId === session.user.id ? g.partner : g.creator;
              return (
                <Link
                  key={g.id}
                  href={`/reservations/${g.id}`}
                  className="flex items-center gap-4 rounded-xl border bg-white p-4 hover:shadow-md transition-shadow"
                >
                  <div className="text-center min-w-[60px]">
                    <div className="text-2xl font-bold text-emerald-600">
                      {format(new Date(g.date), "d")}
                    </div>
                    <div className="text-xs text-gray-500 uppercase">
                      {format(new Date(g.date), "MMM", { locale: pl })}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          RESERVATION_STATUSES[g.status as ReservationStatus].color
                        }`}
                      >
                        {RESERVATION_STATUSES[g.status as ReservationStatus].label}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {g.sportCenter.name}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {g.timeStart} - {g.timeEnd}
                    </div>
                  </div>
                  <div className="text-right">
                    {opponent ? (
                      <div className="text-sm">
                        <div className="font-medium">
                          vs {opponent.firstName} {opponent.lastName}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">
                        Szukasz przeciwnika
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* History */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Historia
        </h2>

        {pastGames.length === 0 ? (
          <div className="text-center py-8 border rounded-xl bg-gray-50">
            <p className="text-gray-500">Brak rozegranych meczów</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pastGames.map((g) => {
              const isHome = g.creatorId === session.user.id;
              const opponent = isHome ? g.partner : g.creator;
              const myScore = isHome
                ? g.matchResult?.homeSetsWon
                : g.matchResult?.guestSetsWon;
              const theirScore = isHome
                ? g.matchResult?.guestSetsWon
                : g.matchResult?.homeSetsWon;
              const won =
                myScore !== undefined &&
                theirScore !== undefined &&
                myScore > theirScore;

              return (
                <Link
                  key={g.id}
                  href={`/reservations/${g.id}`}
                  className="flex items-center gap-4 rounded-xl border bg-white p-4 hover:shadow-md transition-shadow"
                >
                  <div
                    className={`text-center min-w-[60px] rounded-lg py-2 ${
                      won ? "bg-emerald-50" : "bg-red-50"
                    }`}
                  >
                    <div
                      className={`text-xl font-bold ${
                        won ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {myScore}:{theirScore}
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        won ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {won ? "WYGRANA" : "PRZEGRANA"}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">
                      vs {opponent?.firstName} {opponent?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(g.date), "d MMM yyyy", { locale: pl })} &middot;{" "}
                      {g.sportCenter.name}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
