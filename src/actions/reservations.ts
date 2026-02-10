"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createReservationSchema } from "@/lib/validators/reservation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionResult } from "./auth";

export async function createReservation(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Musisz być zalogowany" };
  }

  const raw = {
    sportCenterId: formData.get("sportCenterId") as string,
    date: formData.get("date") as string,
    timeStart: formData.get("timeStart") as string,
    timeEnd: formData.get("timeEnd") as string,
    skillLevel: formData.get("skillLevel") as string,
    comment: (formData.get("comment") as string) || undefined,
  };

  const parsed = createReservationSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const reservationDate = new Date(parsed.data.date);
  if (reservationDate < new Date(new Date().toDateString())) {
    return { success: false, error: "Nie można tworzyć rezerwacji w przeszłości" };
  }

  await prisma.reservation.create({
    data: {
      creatorId: session.user.id,
      sportCenterId: parsed.data.sportCenterId,
      date: reservationDate,
      timeStart: parsed.data.timeStart,
      timeEnd: parsed.data.timeEnd,
      skillLevel: parsed.data.skillLevel,
      comment: parsed.data.comment,
    },
  });

  redirect("/reservations");
}

export async function joinReservation(
  reservationId: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Musisz być zalogowany" };
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });

  if (!reservation) {
    return { success: false, error: "Rezerwacja nie istnieje" };
  }

  if (reservation.creatorId === session.user.id) {
    return { success: false, error: "Nie możesz dołączyć do własnej rezerwacji" };
  }

  if (reservation.status !== "OPEN") {
    return { success: false, error: "Ta rezerwacja jest już zajęta" };
  }

  await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      partnerId: session.user.id,
      status: "CONFIRMED",
    },
  });

  await prisma.notification.create({
    data: {
      userId: reservation.creatorId,
      title: "Nowy partner do gry!",
      content: "Ktoś dołączył do Twojej rezerwacji",
      type: "match_joined",
      link: `/reservations/${reservationId}`,
    },
  });

  revalidatePath("/reservations");
  revalidatePath(`/reservations/${reservationId}`);
  return { success: true };
}

export async function cancelReservation(
  reservationId: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Musisz być zalogowany" };
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });

  if (!reservation) {
    return { success: false, error: "Rezerwacja nie istnieje" };
  }

  if (reservation.creatorId !== session.user.id) {
    return { success: false, error: "Tylko twórca może anulować rezerwację" };
  }

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "CANCELLED" },
  });

  if (reservation.partnerId) {
    await prisma.notification.create({
      data: {
        userId: reservation.partnerId,
        title: "Rezerwacja anulowana",
        content: "Twój przeciwnik anulował rezerwację",
        type: "reservation_cancelled",
        link: `/reservations/${reservationId}`,
      },
    });
  }

  revalidatePath("/reservations");
  return { success: true };
}
