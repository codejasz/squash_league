import { prisma } from "@/lib/prisma";
import { MapPin, Phone, Globe } from "lucide-react";
import Link from "next/link";

export default async function SportCentersPage() {
  const centers = await prisma.sportCenter.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { reservations: true } },
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Centra sportowe</h1>
      <p className="text-gray-500 mb-8">Znajdź kort w swoim mieście</p>

      {centers.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-gray-50">
          <p className="text-gray-500 text-lg">Brak centrów sportowych</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {centers.map((c) => (
            <Link
              key={c.id}
              href={`/sport-centers/${c.slug}`}
              className="rounded-xl border bg-white p-5 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg mb-3">{c.name}</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {c.address}
                  {c.city && `, ${c.city}`}
                </div>
                {c.phoneNumber && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {c.phoneNumber}
                  </div>
                )}
                {c.website && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="h-4 w-4 text-gray-400" />
                    {c.website}
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t text-xs text-gray-400">
                {c._count.reservations} rezerwacji
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
