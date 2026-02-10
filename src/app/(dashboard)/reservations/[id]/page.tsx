import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { SKILL_LEVELS, RESERVATION_STATUSES } from "@/lib/constants";
import { MapPin, Clock, User, Trophy } from "lucide-react";
import { JoinButton } from "@/components/reservations/join-button";
import { ScoreForm } from "@/components/reservations/score-form";
import { ConfirmScoreForm } from "@/components/reservations/confirm-score-form";
import { CancelButton } from "@/components/reservations/cancel-button";
import type { SkillLevel, ReservationStatus } from "@prisma/client";

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      creator: { include: { stats: true } },
      partner: { include: { stats: true } },
      sportCenter: true,
      matchResult: true,
    },
  });

  if (!reservation) notFound();

  const isCreator = session.user.id === reservation.creatorId;
  const isPartner = session.user.id === reservation.partnerId;
  const isParticipant = isCreator || isPartner;
  const isPast = new Date(reservation.date) < new Date(new Date().toDateString());
  const canJoin =
    reservation.status === "OPEN" && !isCreator && !reservation.partnerId;
  const canSubmitScore =
    isParticipant &&
    reservation.status === "CONFIRMED" &&
    isPast &&
    !reservation.matchResult;
  const canConfirmScore =
    reservation.matchResult &&
    reservation.matchResult.status === "AWAITING_CONFIRM" &&
    reservation.matchResult.submittedById !== session.user.id;
  const canCancel = isCreator && reservation.status === "OPEN";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
              RESERVATION_STATUSES[reservation.status as ReservationStatus].color
            }`}
          >
            {RESERVATION_STATUSES[reservation.status as ReservationStatus].label}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
              SKILL_LEVELS[reservation.skillLevel as SkillLevel].color
            }`}
          >
            {SKILL_LEVELS[reservation.skillLevel as SkillLevel].label}
          </span>
        </div>

        <h1 className="text-2xl font-bold mb-6">Szczegóły rezerwacji</h1>

        <div className="rounded-xl border bg-white p-6 space-y-4 mb-6">
          <div className="flex items-center gap-3 text-gray-700">
            <MapPin className="h-5 w-5 text-gray-400" />
            <div>
              <div className="font-medium">{reservation.sportCenter.name}</div>
              <div className="text-sm text-gray-500">
                {reservation.sportCenter.address}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-700">
            <Clock className="h-5 w-5 text-gray-400" />
            <div>
              <div className="font-medium">
                {format(new Date(reservation.date), "EEEE, d MMMM yyyy", {
                  locale: pl,
                })}
              </div>
              <div className="text-sm text-gray-500">
                {reservation.timeStart} - {reservation.timeEnd}
              </div>
            </div>
          </div>

          {reservation.comment && (
            <p className="text-gray-600 italic">
              &quot;{reservation.comment}&quot;
            </p>
          )}
        </div>

        {/* Players */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border bg-white p-5">
            <div className="text-xs uppercase tracking-wide text-gray-400 mb-3">
              Gospodarz
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <User className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="font-medium">
                  {reservation.creator.firstName} {reservation.creator.lastName}
                </div>
                <div className="text-sm text-gray-500">
                  ELO: {reservation.creator.stats?.eloRating ?? 1200}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <div className="text-xs uppercase tracking-wide text-gray-400 mb-3">
              Przeciwnik
            </div>
            {reservation.partner ? (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">
                    {reservation.partner.firstName}{" "}
                    {reservation.partner.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    ELO: {reservation.partner.stats?.eloRating ?? 1200}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Oczekiwanie na przeciwnika...</p>
            )}
          </div>
        </div>

        {/* Match Result */}
        {reservation.matchResult &&
          reservation.matchResult.status === "CONFIRMED" && (
            <div className="rounded-xl border bg-white p-6 mb-6 text-center">
              <Trophy className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <h3 className="font-semibold text-lg mb-2">Wynik meczu</h3>
              <div className="text-3xl font-bold">
                {reservation.matchResult.homeSetsWon} :{" "}
                {reservation.matchResult.guestSetsWon}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {reservation.creator.firstName} vs{" "}
                {reservation.partner?.firstName}
              </div>
            </div>
          )}

        {/* Actions */}
        {canJoin && <JoinButton reservationId={reservation.id} />}

        {canSubmitScore && <ScoreForm reservationId={reservation.id} />}

        {canConfirmScore && reservation.matchResult && (
          <ConfirmScoreForm
            matchResultId={reservation.matchResult.id}
            homeSetsWon={reservation.matchResult.homeSetsWon}
            guestSetsWon={reservation.matchResult.guestSetsWon}
            homePlayerName={`${reservation.creator.firstName} ${reservation.creator.lastName}`}
            guestPlayerName={`${reservation.partner?.firstName} ${reservation.partner?.lastName}`}
          />
        )}

        {reservation.matchResult?.status === "AWAITING_CONFIRM" &&
          reservation.matchResult.submittedById === session.user.id && (
            <div className="rounded-md bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
              Oczekiwanie na potwierdzenie wyniku przez przeciwnika...
            </div>
          )}

        {canCancel && <CancelButton reservationId={reservation.id} />}
      </div>
    </div>
  );
}
