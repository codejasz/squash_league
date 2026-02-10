import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Bell, Check } from "lucide-react";
import Link from "next/link";
import { MarkReadButton } from "@/components/notifications/mark-read-button";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Mark all as read
  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Bell className="h-6 w-6 text-gray-600" />
        <h1 className="text-2xl font-bold">Powiadomienia</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-gray-50">
          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Brak powiadomień</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-xl border p-4 transition-colors ${
                n.isRead ? "bg-white" : "bg-emerald-50 border-emerald-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{n.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{n.content}</p>
                  {n.link && (
                    <Link
                      href={n.link}
                      className="text-emerald-600 text-sm font-medium hover:underline mt-2 inline-block"
                    >
                      Zobacz szczegóły
                    </Link>
                  )}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                  {format(new Date(n.createdAt), "d MMM HH:mm", {
                    locale: pl,
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
