import Link from "next/link";
import { Trophy, Users, Calendar, TrendingUp } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Squash League
          </h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto mb-8">
            Znajdź przeciwnika na swoim poziomie, zarezerwuj kort i rywalizuj
            w ligowym systemie rankingowym ELO.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-base font-semibold text-emerald-700 shadow-lg hover:bg-emerald-50 transition-colors"
            >
              Dołącz do ligi
            </Link>
            <Link
              href="/ranking"
              className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-white/30 px-8 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Zobacz ranking
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Jak to działa?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Users className="h-8 w-8 text-emerald-600" />}
            title="Zarejestruj się"
            description="Stwórz konto i wybierz swój poziom umiejętności — od Szturmowca po Mistrza Yodę."
          />
          <FeatureCard
            icon={<Calendar className="h-8 w-8 text-emerald-600" />}
            title="Zarezerwuj kort"
            description="Stwórz rezerwację w wybranym centrum sportowym i czekaj na przeciwnika."
          />
          <FeatureCard
            icon={<Trophy className="h-8 w-8 text-emerald-600" />}
            title="Rozegraj mecz"
            description="Zagraj mecz, wpisz wynik i poczekaj na potwierdzenie przeciwnika."
          />
          <FeatureCard
            icon={<TrendingUp className="h-8 w-8 text-emerald-600" />}
            title="Wspinaj się w rankingu"
            description="Twój rating ELO rośnie z każdą wygraną. Rywalizuj o czołowe pozycje."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 border-t">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Gotowy na wyzwanie?
          </h2>
          <p className="text-gray-600 mb-8">
            Dołącz do rosnącej społeczności graczy squasha.
          </p>
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-emerald-600 px-8 text-base font-semibold text-white shadow hover:bg-emerald-700 transition-colors"
          >
            Stwórz konto za darmo
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-xl border bg-white hover:shadow-md transition-shadow">
      <div className="mb-4 p-3 rounded-full bg-emerald-50">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
