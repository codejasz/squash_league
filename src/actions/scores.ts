"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { calculateElo } from "@/lib/elo";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "./auth";

export async function submitScore(
  reservationId: string,
  homeSetsWon: number,
  guestSetsWon: number
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Musisz być zalogowany" };
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { matchResult: true },
  });

  if (!reservation || !reservation.partnerId) {
    return { success: false, error: "Rezerwacja nie istnieje lub nie ma partnera" };
  }

  if (
    session.user.id !== reservation.creatorId &&
    session.user.id !== reservation.partnerId
  ) {
    return { success: false, error: "Nie jesteś uczestnikiem tego meczu" };
  }

  if (reservation.matchResult) {
    return { success: false, error: "Wynik już został wpisany" };
  }

  await prisma.matchResult.create({
    data: {
      reservationId,
      homePlayerId: reservation.creatorId,
      guestPlayerId: reservation.partnerId,
      homeSetsWon,
      guestSetsWon,
      submittedById: session.user.id,
      status: "AWAITING_CONFIRM",
    },
  });

  const otherUserId =
    session.user.id === reservation.creatorId
      ? reservation.partnerId
      : reservation.creatorId;

  await prisma.notification.create({
    data: {
      userId: otherUserId,
      title: "Wynik do potwierdzenia",
      content: `Wynik meczu: ${homeSetsWon}:${guestSetsWon}. Potwierdź wynik.`,
      type: "score_submitted",
      link: `/reservations/${reservationId}`,
    },
  });

  revalidatePath(`/reservations/${reservationId}`);
  return { success: true };
}

export async function confirmScore(
  matchResultId: string,
  confirmed: boolean
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Musisz być zalogowany" };
  }

  const matchResult = await prisma.matchResult.findUnique({
    where: { id: matchResultId },
    include: {
      reservation: true,
      homePlayer: { include: { stats: true } },
      guestPlayer: { include: { stats: true } },
    },
  });

  if (!matchResult) {
    return { success: false, error: "Wynik nie istnieje" };
  }

  if (matchResult.submittedById === session.user.id) {
    return { success: false, error: "Nie możesz potwierdzić własnego wyniku" };
  }

  if (!confirmed) {
    await prisma.matchResult.update({
      where: { id: matchResultId },
      data: { status: "DISPUTED" },
    });
    revalidatePath(`/reservations/${matchResult.reservationId}`);
    return { success: true };
  }

  // Confirm score and update stats
  const winnerId =
    matchResult.homeSetsWon > matchResult.guestSetsWon
      ? matchResult.homePlayerId
      : matchResult.guestPlayerId;
  const loserId =
    winnerId === matchResult.homePlayerId
      ? matchResult.guestPlayerId
      : matchResult.homePlayerId;

  const winnerStats = matchResult.homePlayerId === winnerId
    ? matchResult.homePlayer.stats
    : matchResult.guestPlayer.stats;
  const loserStats = matchResult.homePlayerId === loserId
    ? matchResult.homePlayer.stats
    : matchResult.guestPlayer.stats;

  const winnerElo = winnerStats?.eloRating ?? 1200;
  const loserElo = loserStats?.eloRating ?? 1200;
  const { newWinnerRating, newLoserRating } = calculateElo(winnerElo, loserElo);

  await prisma.$transaction([
    prisma.matchResult.update({
      where: { id: matchResultId },
      data: { status: "CONFIRMED" },
    }),
    prisma.reservation.update({
      where: { id: matchResult.reservationId },
      data: { status: "COMPLETED" },
    }),
    prisma.userStats.upsert({
      where: { userId: winnerId },
      create: {
        userId: winnerId,
        gamesPlayed: 1,
        gamesWon: 1,
        setsWon: winnerId === matchResult.homePlayerId
          ? matchResult.homeSetsWon
          : matchResult.guestSetsWon,
        setsLost: winnerId === matchResult.homePlayerId
          ? matchResult.guestSetsWon
          : matchResult.homeSetsWon,
        winStreak: 1,
        bestStreak: 1,
        eloRating: newWinnerRating,
      },
      update: {
        gamesPlayed: { increment: 1 },
        gamesWon: { increment: 1 },
        setsWon: {
          increment: winnerId === matchResult.homePlayerId
            ? matchResult.homeSetsWon
            : matchResult.guestSetsWon,
        },
        setsLost: {
          increment: winnerId === matchResult.homePlayerId
            ? matchResult.guestSetsWon
            : matchResult.homeSetsWon,
        },
        winStreak: { increment: 1 },
        bestStreak: winnerStats
          ? Math.max(winnerStats.bestStreak, (winnerStats.winStreak || 0) + 1)
          : 1,
        eloRating: newWinnerRating,
      },
    }),
    prisma.userStats.upsert({
      where: { userId: loserId },
      create: {
        userId: loserId,
        gamesPlayed: 1,
        gamesLost: 1,
        setsWon: loserId === matchResult.homePlayerId
          ? matchResult.homeSetsWon
          : matchResult.guestSetsWon,
        setsLost: loserId === matchResult.homePlayerId
          ? matchResult.guestSetsWon
          : matchResult.homeSetsWon,
        eloRating: newLoserRating,
      },
      update: {
        gamesPlayed: { increment: 1 },
        gamesLost: { increment: 1 },
        setsWon: {
          increment: loserId === matchResult.homePlayerId
            ? matchResult.homeSetsWon
            : matchResult.guestSetsWon,
        },
        setsLost: {
          increment: loserId === matchResult.homePlayerId
            ? matchResult.guestSetsWon
            : matchResult.homeSetsWon,
        },
        winStreak: 0,
        eloRating: newLoserRating,
      },
    }),
  ]);

  revalidatePath(`/reservations/${matchResult.reservationId}`);
  revalidatePath("/ranking");
  return { success: true };
}
