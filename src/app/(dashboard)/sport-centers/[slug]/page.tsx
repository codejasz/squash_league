import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MapPin, Phone, Globe, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export default async function SportCenterDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const center = await prisma.sportCenter.findUnique({
    where: { slug },
    include: {
      courts: true,
      reservations: {
        where: {
          status: "OPEN",
          date: { gte: new Date(new Date().toDateString()) },
        },
        include: { creator: true },
        orderBy: { date: "asc" },
        take: 10,
      },
    },
  });

  if (!center) notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{center.name}</h1>

        <div className="rounded-xl border bg-white p-6 space-y-3 mb-8">
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="h-5 w-5 text-gray-400" />
            {center.address}
            {center.city && `, ${center.city}`}
          </div>
          {center.phoneNumber && (
            <div className="flex items-center gap-2 text-gray-700">
              <Phone className="h-5 w-5 text-gray-400" />
              {center.phoneNumber}
            </div>
          )}
          {center.website && (
            <div className="flex items-center gap-2 text-gray-700">
              <Globe className="h-5 w-5 text-gray-400" />
              <a
                href={center.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:underline"
              >
                {center.website}
              </a>
            </div>
          )}
        </div>

        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-emerald-600" />
          Otwarte rezerwacje ({center.reservations.length})
        </h2>

        {center.reservations.length === 0 ? (
          <div className="text-center py-8 border rounded-xl bg-gray-50">
            <p className="text-gray-500">
              Brak otwartych rezerwacji w tym centrum
            </p>
            <Link
              href="/reservations/new"
              className="text-emerald-600 text-sm font-medium hover:underline mt-2 inline-block"
            >
              Stwórz nową rezerwację
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {center.reservations.map((r) => (
              <Link
                key={r.id}
                href={`/reservations/${r.id}`}
                className="flex items-center justify-between rounded-xl border bg-white p-4 hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="font-medium">
                    {format(new Date(r.date), "d MMM yyyy", { locale: pl })}
                  </div>
                  <div className="text-sm text-gray-500">
                    {r.timeStart} - {r.timeEnd}
                  </div>
                </div>
                <div className="text-right text-sm text-gray-600">
                  {r.creator.firstName} {r.creator.lastName}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
