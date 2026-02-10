import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Trophy, Menu, LogOut, User, Bell } from "lucide-react";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Trophy className="h-6 w-6 text-emerald-600" />
          <span>Squash League</span>
        </Link>

        {session?.user ? (
          <nav className="flex items-center gap-4">
            <Link
              href="/reservations"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Rezerwacje
            </Link>
            <Link
              href="/my-games"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Moje mecze
            </Link>
            <Link
              href="/ranking"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Ranking
            </Link>
            <Link
              href="/sport-centers"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Centra
            </Link>
            <div className="h-6 w-px bg-gray-200" />
            <Link
              href="/notifications"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Bell className="h-5 w-5" />
            </Link>
            <Link
              href="/profile"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <User className="h-5 w-5" />
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                title="Wyloguj"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </nav>
        ) : (
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Zaloguj się
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-medium text-white shadow hover:bg-emerald-700 transition-colors"
            >
              Dołącz do ligi
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
