import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SKILL_LEVELS } from "@/lib/constants";
import { User, TrendingUp, Trophy, Target, Flame } from "lucide-react";
import Link from "next/link";
import type { SkillLevel } from "@prisma/client";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { stats: true },
  });

  if (!user) redirect("/login");

  const stats = user.stats;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
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
          <Link
            href="/profile/edit"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Edytuj profil
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
            label="ELO Rating"
            value={stats?.eloRating ?? 1200}
          />
          <StatCard
            icon={<Trophy className="h-5 w-5 text-amber-500" />}
            label="Wygrane"
            value={stats?.gamesWon ?? 0}
          />
          <StatCard
            icon={<Target className="h-5 w-5 text-blue-500" />}
            label="Mecze"
            value={stats?.gamesPlayed ?? 0}
          />
          <StatCard
            icon={<Flame className="h-5 w-5 text-red-500" />}
            label="Najlepsza seria"
            value={stats?.bestStreak ?? 0}
          />
        </div>

        {/* Detailed Stats */}
        <div className="rounded-xl border bg-white p-6">
          <h2 className="font-semibold text-lg mb-4">Statystyki</h2>
          <div className="space-y-3">
            <StatRow label="Rozegrane mecze" value={stats?.gamesPlayed ?? 0} />
            <StatRow label="Wygrane" value={stats?.gamesWon ?? 0} />
            <StatRow label="Przegrane" value={stats?.gamesLost ?? 0} />
            <StatRow label="Wygrane sety" value={stats?.setsWon ?? 0} />
            <StatRow label="Przegrane sety" value={stats?.setsLost ?? 0} />
            <StatRow label="Aktualna seria" value={stats?.winStreak ?? 0} />
            <StatRow label="Najlepsza seria" value={stats?.bestStreak ?? 0} />
            <StatRow
              label="Win rate"
              value={
                stats && stats.gamesPlayed > 0
                  ? `${Math.round((stats.gamesWon / stats.gamesPlayed) * 100)}%`
                  : "—"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function StatRow({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
