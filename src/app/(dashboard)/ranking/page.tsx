import { prisma } from "@/lib/prisma";
import { SKILL_LEVELS } from "@/lib/constants";
import { Trophy, TrendingUp, Medal } from "lucide-react";
import Link from "next/link";
import type { SkillLevel } from "@prisma/client";

export default async function RankingPage() {
  const players = await prisma.userStats.findMany({
    include: { user: true },
    orderBy: { eloRating: "desc" },
    take: 100,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="h-7 w-7 text-amber-500" />
        <div>
          <h1 className="text-2xl font-bold">Ranking ELO</h1>
          <p className="text-gray-500">Najlepsi gracze w lidze</p>
        </div>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gracz
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Poziom
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mecze
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                W/P
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                ELO
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {players.map((p, i) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  {i < 3 ? (
                    <Medal
                      className={`h-5 w-5 ${
                        i === 0
                          ? "text-amber-400"
                          : i === 1
                          ? "text-gray-400"
                          : "text-amber-700"
                      }`}
                    />
                  ) : (
                    <span className="text-sm text-gray-500">{i + 1}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/profile/${p.user.id}`}
                    className="font-medium hover:text-emerald-600 transition-colors"
                  >
                    {p.user.firstName} {p.user.lastName}
                  </Link>
                  <div className="text-xs text-gray-400">
                    @{p.user.username}
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      SKILL_LEVELS[p.user.skillLevel as SkillLevel].color
                    }`}
                  >
                    {SKILL_LEVELS[p.user.skillLevel as SkillLevel].label}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-600">
                  {p.gamesPlayed}
                </td>
                <td className="px-4 py-3 text-center text-sm">
                  <span className="text-emerald-600 font-medium">
                    {p.gamesWon}
                  </span>
                  /
                  <span className="text-red-500 font-medium">
                    {p.gamesLost}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="font-bold text-lg">{p.eloRating}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {players.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Brak graczy w rankingu. Bądź pierwszy!
          </div>
        )}
      </div>
    </div>
  );
}
