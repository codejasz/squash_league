import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SKILL_LEVELS } from "@/lib/constants";
import { User, TrendingUp, Trophy, Target, Flame } from "lucide-react";
import type { SkillLevel } from "@prisma/client";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { stats: true },
  });

  if (!user) notFound();

  const stats = user.stats;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <User className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-500">@{user.username}</p>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mt-1 ${
                SKILL_LEVELS[user.skillLevel as SkillLevel].color
              }`}
            >
              {SKILL_LEVELS[user.skillLevel as SkillLevel].label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border bg-white p-4 text-center">
            <TrendingUp className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats?.eloRating ?? 1200}</div>
            <div className="text-xs text-gray-500">ELO Rating</div>
          </div>
          <div className="rounded-xl border bg-white p-4 text-center">
            <Trophy className="h-5 w-5 text-amber-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats?.gamesWon ?? 0}</div>
            <div className="text-xs text-gray-500">Wygrane</div>
          </div>
          <div className="rounded-xl border bg-white p-4 text-center">
            <Target className="h-5 w-5 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats?.gamesPlayed ?? 0}</div>
            <div className="text-xs text-gray-500">Mecze</div>
          </div>
          <div className="rounded-xl border bg-white p-4 text-center">
            <Flame className="h-5 w-5 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats?.bestStreak ?? 0}</div>
            <div className="text-xs text-gray-500">Najlepsza seria</div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <h2 className="font-semibold text-lg mb-4">Statystyki</h2>
          <div className="space-y-3">
            {[
              ["Rozegrane mecze", stats?.gamesPlayed ?? 0],
              ["Wygrane", stats?.gamesWon ?? 0],
              ["Przegrane", stats?.gamesLost ?? 0],
              ["Wygrane sety", stats?.setsWon ?? 0],
              ["Przegrane sety", stats?.setsLost ?? 0],
              [
                "Win rate",
                stats && stats.gamesPlayed > 0
                  ? `${Math.round((stats.gamesWon / stats.gamesPlayed) * 100)}%`
                  : "—",
              ],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <span className="text-sm text-gray-600">{String(label)}</span>
                <span className="font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
